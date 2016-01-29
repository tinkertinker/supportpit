import socketio from 'socket.io'
import logger from 'debug'
import { forSocket } from './teams'
import { parse as parseCookie } from 'cookie'
import Promise from 'promise'
import Queue from './queue'
import { v4 as uuid } from 'uuid'
import { identify } from './wpcom'
import { findOrCreateUser, getUser as getGroupsUser, createRoom, getRoom, joinRoom, memberDetails } from './groups'
import { createHmac } from 'crypto'

const SECRET = process.env.SECRET || uuid()

let debug = logger( 'tardis.chat' )

function parseToken( socket ) {
	const { cookie } = socket.request.headers
	if ( !cookie ) {
		return null
	}
	const { token } = parseCookie( cookie )
	return token
}

function asPromise( fn ) {
	return new Promise( ( resolve, reject ) => {
		fn( ( e, ... resolved ) => {
			if ( e ) return reject( e )
			resolve( ... resolved )
		} )
	} )
}

function getTeam( socket ) {
	return asPromise( forSocket.bind( null, socket ) )
}

function getUser( token, team ) {
	return asPromise( team.identify.bind( team, token ) )
}

// function combine( fn ) {
// 	return ( a ) => {
// 		return new Promise( ( resolve, reject ) => {
// 			fn( a ).then( ( b ) => resolve( [ a, b ] ), reject )
// 		} )
// 	}
// }

function sign( value, callback ) {
	process.nextTick( () => {
		const hmac = createHmac( 'sha256', SECRET );
		hmac.update( value )
		callback( null, `${value}.${hmac.digest( 'base64' )}` )
	} )
}

function verify( signed, callback ) {
	const index = signed.lastIndexOf( '.' )
	if ( index < 0 ) {
		return callback( new Error( 'missing signature' ) )
	}

	const value = signed.slice( 0, index )

	sign( value, ( e, verified ) => {
		if ( signed !== verified ) {
			return callback( new Error( 'signature does not match' ) )
		}
		callback( null, value )
	} )
}

export default function( server ) {
	let io = socketio( server )

	const queue = new Queue( io )

	io.of( '/group' ).on( 'connection', ( socket ) => {
		debug( 'socket joined', socket.id )
		const startSession = ( user ) => {
			const onAction = ( room_id, action ) => {
				// check if the socket is in the room
				const to = `room-${room_id}`
				if ( socket.rooms[to] ) {
					getRoom( room_id, ( e, room ) => {
						if ( e ) return debug( 'room does not exist', e )
						debug( 'onAction', action )
						const userAction = Object.assign( {}, action, {
							user: Object.assign( {}, memberDetails( user ), { id: user.id } )
						} )
						room.actions = room.actions.concat( userAction )
						io.of( '/group' ).to( to ).emit( 'action', room_id, userAction )
					} )
				} else {
					debug( 'User is not member of room', room_id )
				}
			}
			const initializeRoom = ( e, room, newUser ) => {
				socket.emit( 'init-room', room )
				if ( newUser ) {
					onAction( room.id, { type: 'join' } )
				}
			}

			// The user hasn't joined the room yet but is watching
			const viewRoom = ( room ) => {
				socket.join( `room-${room.id}` )
				initializeRoom( null, room, false )
			}

			socket.on( 'view-room', ( id ) => getRoom( id, ( e, room ) => viewRoom( room ) ) )
			socket.on( 'start-room', () => createRoom( user, ( e, room ) => joinRoom( socket, user, room, initializeRoom ) ) )
			socket.on( 'join-room', ( id ) => getRoom( id, ( e, room ) => joinRoom( socket, user, room, initializeRoom ) ) )
			sign( user.id, ( e, token ) => {
				debug( 'signed id?', token )
				socket.emit( 'session', { token, user } )
				socket.join( `user-${user.id}`, ( e ) => {
					if ( e ) return debug( 'failed to join user room', e )
					debug( 'socket joined user room' )
				} )
			} )
			socket.on( 'action', ( id, action ) => {
				// TODO: check if user is a member of the room they're attempting to send an action for
				onAction( id, action )
				// let outbound = Object.assign( {}, action, { user, chat_id: chat.id } )
				// io.of( '/chat' ).to( chat.id ).emit( 'action', outbound )
				// io.to( chat.id ).emit( 'action', outbound )
			} )
		}

		socket.emit( 'authorize' )
		socket.on( 'auth', ( auth_details ) => {
			debug( 'use token to access user data', auth_details )
			identify( auth_details, ( e, identity ) => {
				// now we register the user
				findOrCreateUser( auth_details.service, auth_details.token, identity, ( e, user ) => {
					startSession( user )
				} )
			} )
		} )
		socket.on( 'token', ( token ) => {
			debug( 'check signed token', token )
			verify( token, ( e, value ) => {
				// find the user
				if ( e ) {
					return socket.emit( 'unauthorized' )
				}
				getGroupsUser( value, ( e, user ) => {
					if ( e || !user ) {
						return socket.emit( 'unauthorized' )
					}
					startSession( user )
				} )
			} )
		} )
	} )

	io.of( '/chat' ).on( 'connection', ( socket ) => {
		let token = parseToken( socket )

		let onUser = ( user ) => {
			let chat = queue.open( socket, user )
			socket.emit( 'init', chat.id, user )
			socket.join( chat.id, () => {
				debug( 'User has joined their support chat', chat.id )
			} )
			socket.on( 'action', ( action, fn ) => {
				fn( 'received' )
				debug( 'sending to', chat.id, action )
				// Send the message to anyone in this chat
				let outbound = Object.assign( {}, action, { user, chat_id: chat.id } )
				io.of( '/chat' ).to( chat.id ).emit( 'action', outbound )
				io.to( chat.id ).emit( 'action', outbound )
			} )
			io.emit( 'open-request', chat.asJSON() )
			socket.on( 'disconnect', () => {
				io.emit( 'close-request', chat.asJSON() )
			} )
		}

		getTeam( socket )
		.then( ( team ) => {
			socket.emit( 'team', team )
			getUser( token, team )
			.then( onUser )
			.catch( ( e ) => {
				debug( 'User not found', e )
				socket.emit( 'identify' )
				socket.on( 'identify', ( name ) => {
					onUser( { name, anonymous: true, id: uuid() } )
				} )
				// give the client a chance to enter user's info
			} )
		} )
		.catch( () => socket.emit( 'error', 'unknown-host' ) )
	} )

	io.on( 'connection', ( socket ) => {
		// If the user is an agent add the to the agent room
		// TODO: authenticate agent
		let user = { picture: 'http://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=200&r=pg&d=mm', name: 'Douglas Adams', id: 'sample' }
		socket.emit( 'authorized', user )
		socket.emit( 'chats', queue.openChats() )
		socket.on( 'action', ( chatId, action, complete ) => {
			debug( 'Received action', action )
			let outbound = Object.assign( {}, action, {user, chat_id: chatId} )
			io.of( '/chat' ).to( chatId ).emit( 'action', outbound )
			io.to( chatId ).emit( 'action', outbound )
			complete()
		} )
		socket.on( 'join-chat', ( id, fn ) => {
			debug( 'join chat', id )
			let chat = queue.join( socket, id, fn )

			if ( !chat ) {
				return debug( 'Failed to find chat', id )
			}

			if ( socket.rooms[id] ) {
				debug( 'already in room', id )
				return
			}

			socket.join( id, ( e ) => {
				if ( e ) return debug( 'Failed to join room', chat.id, id )
				fn( chat.user )
				let action = { type: 'join', user, chat_id: id }
				io.of( '/chat' ).to( id ).emit( 'action', action )
				io.to( id ).emit( 'action', action )
			} )
		} )
	} )
}

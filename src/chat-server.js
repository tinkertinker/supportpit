import socketio from 'socket.io'
import logger from 'debug'
import { forSocket } from './teams'
import { parse as parseCookie } from 'cookie'
import Promise from 'promise'
import Queue from './queue'
import { v4 as uuid } from 'uuid'

let debug = logger( 'tardis.chat' )

function parseToken( socket ) {
	const { token } = parseCookie( socket.request.headers.cookie )
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

export default function( server ) {
	let io = socketio( server )

	const queue = new Queue( io )

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
			io.emit( 'open-request', user, user.id )
			socket.on( 'disconnect', () => {
				io.emit( 'close-request', user, user.id )
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

			socket.on( 'action', ( chatId, action, complete ) => {
				let outbound = Object.assign( {}, action, {user, chat_id: chatId} )
				io.of( '/chat' ).to( chatId ).emit( 'action', outbound )
				io.to( chatId ).emit( 'action', outbound )
				complete()
			} )
		} )
	} )
}

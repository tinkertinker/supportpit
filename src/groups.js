// import { v4 as uuid } from 'uuid'
import { pickBy, values } from 'lodash/object'
import { isEmpty } from 'lodash/lang'
import { v4 as uuid } from 'uuid'
import logger from 'debug'

const debug = logger( 'tardis.groups' )

const USERS = { test: { name: 'Shit', id: 'test' } }
const ROOMS = {}
const MEMBERSHIPS = {}

function generateId( callback ) {
	process.nextTick( () => {
		callback( null, uuid() )
	} )
}

function generateRoomId( callback ) {
	process.nextTick( () => callback( null, uuid() ) )
}

export function register( service, auth, identity, callback ) {
	generateId( ( e, id ) => {
		const user = Object.assign( {}, { id, identities: [ { service, identity, auth } ] } )
		USERS[id] = user
		callback( e, user )
	} )
}

export function getUser( id, complete ) {
	let user = USERS[id]
	process.nextTick( () => complete( null, user ) )
}

export function findOrCreateUser( service, auth, identity, callback ) {
	process.nextTick( () => {
		const users = pickBy( USERS, ( user ) => userMatches( user, service, identity ) )
		if ( isEmpty( users ) ) {
			return register( service, auth, identity, callback )
		}
		callback( null, values( users )[0] )
	} )
}

export function createRoom( user, callback ) {
	process.nextTick( () => {
		debug( 'create a new room for this user', user.id )
		generateRoomId( ( e, id ) => {
			const room = Object.assign( {}, { id, creator: user.id, actions: [], members: {} } )
			ROOMS[id] = room
			callback( null, room )
		} )
	} )
}

export function getRoom( id, callback ) {
	process.nextTick( () => {
		const room = ROOMS[id]
		if ( !room ) {
			return callback( new Error( 'room does not exist' ) )
		}
		callback( null, room )
	} )
}

export function joinRoom( socket, user, room, callback ) {
	process.nextTick( () => {
		// if the user is already in the room, mark their status
		let newMember = false
		if ( !room.members[user.id] ) {
			newMember = true
			room.members[user.id] = Object.assign( {}, { id: user.id }, memberDetails( user ) )
		}
		let memberships = MEMBERSHIPS[user.id] || []
		if ( memberships.indexOf( room.id ) === -1 ) {
			MEMBERSHIPS[user.id] = memberships.concat( room.id )
		}
		socket.join( `room-${room.id}`, ( e ) => {
			if ( e ) return callback( e )
			callback( null, room, newMember )
		} )
	} )
}

export function memberDetails( user ) {
	// pick the first identitty
	let identity = user.identities[0]

	return {
		name: identity.identity.display_name,
		picture: identity.identity.avatar_URL
	}
}

function userMatches( user, service, identity ) {
	// TODO: extract service specific functionality into own components
	if ( user && user.identities ) {
		return user.identities.find( ( userIdentity ) => {
			return userIdentity && userIdentity.service === service && userIdentity.identity.ID === identity.ID
		} )
	}
}

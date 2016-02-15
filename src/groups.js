// import { v4 as uuid } from 'uuid'
import { pickBy, values } from 'lodash/object'
import { isEmpty } from 'lodash/lang'
import { v4 as uuid } from 'uuid'
import logger from 'debug'
import mongoose, { Schema } from 'mongoose'

mongoose.connect( process.env.MONGODB_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/chat' )

const RoomSchema = new Schema( {
	id: String,
	creator: String,
	actions: [{user: Object, timestamp: Number, type: String, id: String, message: String}],
	members: [{id: String, picture: String, name: String }]
} )

const UserSchema = new Schema( {
	id: String,
	identities: [{ service: String, identity: Object, auth: Object }]
} )

const User = mongoose.model( 'User', UserSchema )
const Room = mongoose.model( 'Room', RoomSchema )

const debug = logger( 'tardis.groups' )

// const USERS = { test: { name: 'Shit', id: 'test' } }
// const ROOMS = {}
// const MEMBERSHIPS = {}

function generateId( callback ) {
	process.nextTick( () => {
		callback( null, uuid() )
	} )
}

function generateRoomId( callback ) {
	process.nextTick( () => callback( null, uuid() ) )
}

export function register( service, auth, identity, callback ) {
	generateId( ( idError, id ) => {
		const user = new User( { id, identities: [ { service, identity, auth } ] } )
		user.save( ( e ) => {
			if ( e ) return callback( e )
			debug( 'Registered new user', user )
			callback( null, user )
		} )
	} )
}

export function getUser( id, callback ) {
	User.findOne( {id} ).exec( ( e, user ) => {
		if ( e ) return callback( e )
		callback( null, user )
	} )
}

export function findOrCreateUser( service, auth, identity, callback ) {
	process.nextTick( () => {
		// depending on the service, different query operators
		User.findOne( { identities: { $elemMatch: { service, 'identity.ID': identity.ID } } } ).exec( ( e, user ) => {
			if ( e ) return callback( e )
			if ( !user ) return register( service, auth, identity, callback )
			callback( null, user )
		} )
	} )
}

export function createRoom( user, callback ) {
	debug( 'create a new room for this user', user.id )
	generateRoomId( ( idError, id ) => {
		const room = new Room( { id, creator: user.id, actions: [], members: {} } )
		room.save( ( e ) => {
			if ( e ) return callback( e )
			debug( 'Have a room?', room )
			callback( null, room )
		} )
	} )
}

export function getRoom( id, callback ) {
	const room = Room.findOne( {id} ).exec( ( e, room ) => {
		if ( e ) return callback( e )
		if ( !room ) return callback( new Error( `room does not exist: ${id}`) )
		callback( null, room )
	} )
}

export function joinRoom( socket, user, room, callback ) {
	// if the user is already in the room, mark their status
	const onJoin = ( isNewMember ) => {
		debug( 'Joining room' )
		socket.join( `room-${room.id}`, ( e ) => {
			if ( e ) return callback( e )
			callback( null, room, isNewMember )
		} )
	}

	debug( 'joining room', room )

	let membership = room.members.find( ( existing ) => existing.id === user.id )

	if ( membership ) {
		onJoin( false )
		return
	}

	membership = Object.assign( {}, { id: user.id }, memberDetails( user ) )
	room.set( 'members', room.members.concat( membership ) )
	room.save( ( e ) => {
		if ( e ) return callback( e )
		debug( 'Added membership', membership, room.id )
		onJoin( true )
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

export function recordRoomAction( room, action, callback ) {
	const newActions = room.actions.concat( action )
	room.set( 'actions',  newActions )
	debug( 'Recording action', newActions )
	debug( 'Actions set to', room.actions )
	room.save( ( e ) => {
		if ( e ) return callback( e )
		debug( 'Added actions to room', room )
		callback()
	} )
}

function userMatches( user, service, identity ) {
	// TODO: extract service specific functionality into own components
	if ( user && user.identities ) {
		return user.identities.find( ( userIdentity ) => {
			return userIdentity && userIdentity.service === service && userIdentity.identity.ID === identity.ID
		} )
	}
}

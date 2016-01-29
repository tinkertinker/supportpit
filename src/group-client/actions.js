import socket from './socket'
import logger from 'debug'
import { v4 as uuid } from 'uuid'

const debug = logger( 'tardis.actions' )

export function sendAuthToken( auth_token ) {
	return () => {
		socket.emit( 'auth', auth_token )
	}
}

export const SET_USER = 'SET_USER'
export function setUser( user ) {
	return {
		type: SET_USER,
		user
	}
}

export const SET_MESSAGE = 'SET_MESSAGE'
export function setMessage( message ) {
	return {
		type: SET_MESSAGE,
		message
	}
}

export const sendMessage = ( chat_id, message ) => ( dispatch ) => {
	const id = uuid()
	const action = { message, id, type: 'message', timestamp: now() }
	dispatch( clearMessage() )
	// dispatch( sentMessage( action ) )
	socket.emit( 'action', chat_id, action )
}

export const CLEAR_MESSAGE = 'CLEAR_MESSAGE'
export function clearMessage() {
	return {
		type: CLEAR_MESSAGE
	}
}

export const SET_AUTHENTICATION_STATUS = 'SET_AUTHENTICATION_STATUS'
export function setAuthenticationStatus( status = 'unknown' ) {
	return {
		type: SET_AUTHENTICATION_STATUS,
		status
	}
}

export const CREATE_ROOM = 'CREATE_ROOM'
export function createRoom() {
	return () => {
		socket.emit( 'start-room' )
	}
}

export const INIT_ROOM = 'INIT_ROOM'
export function initRoom( room ) {
	history.replaceState( room, 'Room', `/${room.id}`)
	return {
		type: INIT_ROOM,
		room
	}
}

export const RECEIVE_ROOM_ACTION = 'RECEIVE_ROOM_ACTION'
export function receiveRoomAction( room_id, action ) {
	return {
		type: RECEIVE_ROOM_ACTION,
		room_id, action
	}
}

function now() {
	return ( new Date() ).getTime()
}

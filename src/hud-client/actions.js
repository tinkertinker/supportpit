import socket from './socket'
import logger from 'debug'
const debug = logger( 'tardis.actions' )

export const OPEN_REQUEST = 'OPEN_REQUEST'
export function openRequest( user, id ) {
	return {
		type: OPEN_REQUEST,
		user, id
	}
}

export const CLOSE_REQUEST = 'CLOSE_REQUEST'
export function closeRequest( user, id ) {
	return {
		type: CLOSE_REQUEST,
		user, id
	}
}

export const JOIN_CHAT = 'JOIN_CHAT'
export function joinChat( chat ) {
	return ( dispatch ) => {
		socket.emit( 'join-chat', chat.id, ( user ) => {
			dispatch( openChat( chat ) )
		} )
	}
}

export const JOINED_CHAT = 'JOINED_CHAT'
export function joinedChat( chat ) {
	return {
		type: JOINED_CHAT,
		chat: chat
	}
}

export const OPEN_CHAT = 'OPEN_CHAT'
function openChat( chat ) {
	return {
		type: OPEN_CHAT,
		chat
	}
}

export const RECEIVE_ACTION = 'RECEIVE_ACTION'
export function receiveAction( action ) {
	return {
		type: RECEIVE_ACTION,
		action, id: action.chat_id
	}
}

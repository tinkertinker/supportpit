import socket from './socket'
import logger from 'debug'
import { v4 as uuid } from 'uuid'
const debug = logger( 'tardis.actions' )

export const OPEN_REQUEST = 'OPEN_REQUEST'
export function openRequest( chat ) {
	return {
		type: OPEN_REQUEST,
		chat: chat
	}
}

export const CLOSE_REQUEST = 'CLOSE_REQUEST'
export function closeRequest( chat ) {
	return {
		type: CLOSE_REQUEST,
		chat: chat
	}
}

export const JOIN_CHAT = 'JOIN_CHAT'
export function joinChat( chat ) {
	console.warn( 'join chat', chat )
	return ( dispatch ) => {
		socket.emit( 'join-chat', chat.id, () => {
			console.warn( 'open chat', chat )
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

export const EDIT_MESSAGE = 'EDIT_MESSAGE'
export function updateChatMessage( chat, message ) {
	return { type: EDIT_MESSAGE, chat, message }
}

export const CLEAR_MESSAGE = 'CLEAR_MESSAGE'
export function clearChatMessage( chat ) {
	return { type: CLEAR_MESSAGE, chat }
}

export const SEND_MESAGE = 'SEND_MESSAGE'
export function sendChatMessage( chat, message ) {
	return ( dispatch ) => {
		const id = uuid()
		const action = { message, id, type: 'message', timestamp: now(), chat_id: chat.id }
		dispatch( clearChatMessage( chat ) )
		// dispatch( sentChatMessage( chat, action ) )
		socket.emit( 'action', chat.id, action, () => {
			debug( 'confirmed message', action )
		} )
	}
}

export const SET_USER = 'SET_USER'
export function setUser( user ) {
	return {
		type: SET_USER,
		user
	}
}

export const SET_EXISTING_QUEUE = 'SET_EXISTING_QUEUE'
export function setExistingQueue( chats ) {
	return {
		type: SET_EXISTING_QUEUE,
		chats
	}
}

export const SET_AWAY = 'SET_AWAY'
export const SET_PRESENT = 'SET_PRESENT'
export function setStatus( away = true ) {
	const type = away ? SET_AWAY : SET_PRESENT
	const away_at = away ? now() : null
	return { type, away_at }
}

function now() {
	return ( new Date() ).getTime()
}

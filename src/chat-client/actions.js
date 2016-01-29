import socket from './socket'
import logger from 'debug'
import { v4 as uuid } from 'uuid'

const debug = logger( 'tardis.actions' )

export const INIT_CHAT = 'INIT_CHAT'
export function initChat( user ) {
	return {
		type: INIT_CHAT,
		user
	}
}

export const INPUT_NICKNAME = 'INPUT_NICKNAME'
export function inputNickname( name ) {
	return {
		type: INPUT_NICKNAME,
		name
	}
}

export const IDENTIFY = 'IDENTIFY'
export function identify( name ) {
	return () => {
		socket.emit( 'identify', name )
	}
}

export const UPDATE_TEAM = 'UPDATE_TEAM'
export function updateTeam( team ) {
	return {
		type: UPDATE_TEAM,
		team
	}
}

export const UPDATE_MESSAGE = 'UPDATE_MESSAGE'
export function updateMessage( message ) {
	return { type: UPDATE_MESSAGE, message }
}

export const CLEAR_MESSAGE = 'CLEAR_MESSAGE'
export function clearMessage() {
	return { type: CLEAR_MESSAGE }
}

export const SEND_MESSAGE = 'SEND_MESSAGE'
export function sendMessage( message ) {
	return ( dispatch ) => {
		const id = uuid()
		const action = { message, id, type: 'message', timestamp: now() }
		dispatch( clearMessage() )
		dispatch( sentMessage( action ) )
		socket.emit( 'action', action, () => {
			debug( 'confirmed message', action )
		} )
	}
}

export const SENT_MESSAGE = 'SENT_MESSAGE'
export function sentMessage( message ) {
	return { type: SENT_MESSAGE, message }
}

export const RECEIVE_ACTION = 'RECEIVE_ACTION'
export function receiveAction( action ) {
	return { type: RECEIVE_ACTION, action }
}

export const IDENTIFY_USER = 'IDENTIFY_USER'
export function identifyUser() {
	return { type: IDENTIFY_USER }
}

function now() {
	return ( new Date() ).getTime()
}

import { combineReducers as combine } from 'redux'
import { SET_USER, SET_MESSAGE, CLEAR_MESSAGE, SET_AUTHENTICATION_STATUS, INIT_ROOM, RECEIVE_ROOM_ACTION } from './actions'

function user( state = {}, action ) {
	switch ( action.type ) {
		case SET_USER:
			return Object.assign( {}, action.user )
		default:
			return state
	}
}

function message( state = '', action ) {
	switch ( action.type ) {
		case SET_MESSAGE:
			return action.message
		case CLEAR_MESSAGE:
			return ''
		default:
			return state
	}
}

function authenticationStatus( state = 'unknown', action ) {
	switch ( action.type ) {
		case SET_AUTHENTICATION_STATUS:
			return action.status
		case SET_USER:
			return 'authenticated'
		default:
			return state
	}
}

function room( state = {}, action ) {
	switch ( action.type ) {
		case INIT_ROOM:
			return Object.assign( {}, action.room )
		case RECEIVE_ROOM_ACTION:
			const { room_id } = action
			if ( state.id !== room_id ) {
				return state
			}
			return Object.assign( {}, state, { actions: state.actions.concat( action.action ) } )
		default:
			return state
	}
}

function rooms( state = [] ) {
	return state
}

export default combine( { user, message, authenticationStatus, rooms, room } )

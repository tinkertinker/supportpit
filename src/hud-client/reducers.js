import { combineReducers as combine } from 'redux'
import { OPEN_REQUEST, CLOSE_REQUEST, RECEIVE_ACTION, OPEN_CHAT, EDIT_MESSAGE, CLEAR_MESSAGE, SET_USER } from './actions'
import { omit } from 'lodash/object'

function online( state = [] ) {
	return state
}

function availableChats( state = [], action ) {
	switch ( action.type ) {
		case OPEN_REQUEST:
			return state.concat( { user: Object.assign( {}, action.user ), id: action.id } )
		case CLOSE_REQUEST:
			return state.filter( ( existing ) => existing.id !== action.id )
		default:
			return state
	}
}

function chats( state = [], action ) {
	switch ( action.type ) {
		case OPEN_CHAT:
			return state.concat( chat( undefined, action ) )
		case RECEIVE_ACTION:
				// If we find an existing chat send the action to that chat, otherwise open a new chat
			return state.map( ( existing ) => {
				if ( existing.id !== action.id ) {
					return existing
				}
				return chat( existing, action )
			} )
		default:
			return state
	}
}

function chat( state = { actions: [], user: {}, id: null }, action ) {
	switch ( action.type ) {
		case OPEN_CHAT:
			return Object.assign( {}, state, { user: action.chat.user, id: action.chat.id } )
		case RECEIVE_ACTION:
			return Object.assign( {}, state, { actions: state.actions.concat( action.action ) } )
		default:
			return state
	}
}

function editing( state = {}, action ) {
	switch ( action.type ) {
		case EDIT_MESSAGE:
			const message = {}
			message[action.chat.id] = action.message
			return Object.assign( {}, state, message )
		case CLEAR_MESSAGE:
			return omit( state, action.chat.id )
		default:
			return state
	}
}

function pending( state = {} ) {
	return state
}

function user( state = {}, action ) {
	switch ( action.type ) {
		case SET_USER:
			return Object.assign( {}, action.user )
		default:
			return state
	}
}

const reducers = combine( { online, availableChats, chats, editing, pending, user } )

export { reducers as default }

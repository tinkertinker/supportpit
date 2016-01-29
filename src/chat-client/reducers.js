import { combineReducers as combine } from 'redux'
import { INIT_CHAT, UPDATE_MESSAGE, CLEAR_MESSAGE, SENT_MESSAGE, RECEIVE_ACTION, UPDATE_TEAM, IDENTIFY_USER, INPUT_NICKNAME } from './actions'
// import logger from 'debug'

// const debug = logger( 'tardis.reducer' )

function actions( state = [], action ) {
	switch ( action.type ) {
		case RECEIVE_ACTION:
			return state.concat( action.action )
		default:
			return state
	}
}

function message( state = '', action ) {
	switch ( action.type ) {
		case UPDATE_MESSAGE:
			return action.message
		case CLEAR_MESSAGE:
			return ''
		default:
			return state
	}
}

function pendingMessages( state = [], action ) {
	switch ( action.type ) {
		case SENT_MESSAGE:
			return state.concat( action.message )
		case RECEIVE_ACTION:
			return state.filter( ( pending ) => pending.id !== action.action.id )
		default:
			return state
	}
}

function user( state = { indentified: false }, action ) {
	switch ( action.type ) {
		case INIT_CHAT:
			return Object.assign( {}, state, { user: action.user, identified: true } )
		default:
			return state
	}
	return state
}

function team( state = {}, action ) {
	switch ( action.type ) {
		case UPDATE_TEAM:
			return Object.assign( {}, state, { team: action.team } )
		default:
			return state
	}
}

function authorization( state = 'unknown', action ) {
	switch ( action.type ) {
		case IDENTIFY_USER:
			return 'requested'
		case INIT_CHAT:
			return 'authorized'
		default:
			return state
	}
}

function nickname( state = '', action ) {
	switch ( action.type ) {
		case INPUT_NICKNAME:
			return action.name
		default:
			return state
	}
}

const reducer = combine( { actions, pendingMessages, message, team, user, authorization, nickname } )

export { reducer as default }

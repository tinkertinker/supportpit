import { combineReducers as combine } from 'redux'
import { OPEN_REQUEST, CLOSE_REQUEST, RECEIVE_ACTION, OPEN_CHAT } from './actions'

function online( state = [], action ) {
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

const reducers = combine( { online, availableChats, chats } )

export { reducers as default }

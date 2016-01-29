import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash/lang'
import Chat from '../../chat-client/ui/chat'
import { setMessage, sendMessage, createRoom } from '../actions'
import { stringify } from 'querystring'
import { get } from '../../settings'
import logger from 'debug'
import { not, when, or } from '../../react-fn'
import './style'

const debug = logger( 'tardis.client' )

const query = stringify( {
	client_id: get( 'wordpress-com-client-id' ),
	redirect_uri: get( 'wordpress-com-redirect-uri' ),
	response_type: 'token'
} )

const chat = ( { message, dispatch, canSend, actions, room, user } ) => (
	<Chat
		canSend={ canSend }
		onUpdateMessage={ ( newMessage ) => dispatch( setMessage( newMessage ) ) }
		onSendMessage={ () => dispatch( sendMessage( room.id, message ) ) }
		isRemoteMessage={ ( action ) => action.user.id !== user.id }
		message={ message }
		actions={ actions }
		title="Group Chat" />
)

const login = ( { authURL } ) => (
	<div className="login-form">
		<a href={authURL}>Sign in with WordPress.com</a>
	</div>
)

const listRooms = ( { rooms, dispatch } ) => (
	<div className="room-list">
		<div onClick={ () => dispatch( createRoom() ) }>Start new room</div>
	</div>
)

const pipe = ( ... actions ) => ( props ) => {
	var i = 0, action, result
	for ( i = 0; i < actions.length; i++ ) {
		action = actions[i]
		result = action( props )
		if ( result ) {
			return result
		}
	}
	throw new Error( 'Nothing to render' )
}

const loading = () => (
	<div className="loading-indicator"><div className="throbber"></div></div>
)
const userPresent = ( { user } ) => !isEmpty( user )
const notAuthenticated = ( { authenticationStatus } ) => authenticationStatus === 'not-authenticated'
const authenticationUnknown = ( { authenticationStatus } ) => authenticationStatus === 'unknown'
const viewingRoom = ( { room } ) => !isEmpty( room )

const composed = pipe(
	when( notAuthenticated, login ),
	when( or( authenticationUnknown, not( userPresent ) ), loading ),
	when( not( viewingRoom ), listRooms ),
	when( userPresent, chat ),
	() => <div>Nada</div>
)

const map = ( { user, message, actions, authenticationStatus, room, rooms } ) => {
	const authURL = `https://public-api.wordpress.com/oauth2/authorize?${query}`
	return {
		user, message, authURL, authenticationStatus, room, rooms,
		actions: room.actions || [],
		canSend: !isEmpty( message ) }
}

export default connect( map )( composed )

import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash/lang'
import Chat from '../../chat-client/ui/chat'
import { setMessage, sendMessage, createRoom } from '../actions'
import { not, when, or, pipe } from '../../react-fn'
import { authURL } from '../../wpcom'
import './style'

const debug = require( 'debug' )( 'tardis.client' )

const chat = ( { message, dispatch, canSend, actions, room, user } ) => (
	<div id="chat-container">
		<Chat
			canSend={ canSend }
			onUpdateMessage={ ( newMessage ) => dispatch( setMessage( newMessage ) ) }
			onSendMessage={ () => dispatch( sendMessage( room.id, message ) ) }
			isRemoteMessage={ ( action ) => action.user.id !== user.id }
			message={ message }
			actions={ actions }
			title="Group Chat" />
	</div>
)

const login = () => (
	<div className="login-form">
		<a href={authURL}>Sign in with WordPress.com</a>
	</div>
)

const listRooms = ( { rooms, dispatch } ) => (
	<div className="room-list">
		<div onClick={ () => dispatch( createRoom() ) }>Start new room</div>
	</div>
)

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
	return {
		user, message, authenticationStatus, room, rooms,
		actions: room.actions || [],
		canSend: !isEmpty( message ) }
}

export default connect( map )( composed )

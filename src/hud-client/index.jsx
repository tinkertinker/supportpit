import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from '../configure-store'
import socket from './socket'
import reducer from './reducers'
import App, { haveToken, getToken } from './ui/app'
import { when } from '../react-fn'
import {
	showTypingActivity,
	openRequest,
	closeRequest,
	receiveAction,
	setUser,
	setExistingQueue,
	setStatus
} from './actions'

const debug = require( 'debug' )( 'tardis:hud' )
const store = configureStore( reducer )

const node = document.createElement( 'div' )
document.body.appendChild( node )

const authorize = when(
	haveToken,
	() => socket.emit( 'authorize', getToken(), ( user ) => store.dispatch( setUser( user ) ) )
)

socket.on( 'connect', () => {
	debug( 'connected' )
} )

socket.on( 'open-request', ( chat ) => {
	store.dispatch( openRequest( chat ) )
} )

socket.on( 'close-request', ( chat ) => {
	store.dispatch( closeRequest( chat ) )
} )

socket.on( 'action', ( action ) => {
	debug( 'Received action', action )
	store.dispatch( receiveAction( action ) )
} )

socket.on( 'typing', ( user, chat_id ) => {
	store.dispatch( showTypingActivity( user, chat_id ) )
} )

socket.on( 'authorized', ( user ) => {
	store.dispatch( setUser( user ) )
} )

socket.on( 'authorize', authorize )

socket.on( 'chats', ( chats ) => {
	store.dispatch( setExistingQueue( chats ) )
} )

window.addEventListener( 'blur', () => {
	store.dispatch( setStatus( true ) )
} )
window.addEventListener( 'focus', () => {
	store.dispatch( setStatus( false ) )
} )
if ( window.Notification ) {
	Notification.requestPermission( () => {} )
}

store.dispatch( setStatus( !document.hasFocus() ) )

render(
	<div className="container">
		<Provider store={store}>
			<App />
		</Provider>
	</div>,
	node
)

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import Hud from './ui/hud'
import configureStore from '../configure-store'
import logger from 'debug'
import { openRequest, closeRequest, receiveAction, setUser, setExistingQueue, setStatus } from './actions'
import socket from './socket'
import reducer from './reducers'

const debug = logger( 'tardis.hud' )
const store = configureStore( reducer )

const node = document.createElement( 'div' )
document.body.appendChild( node )

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

socket.on( 'authorized', ( user ) => {
	store.dispatch( setUser( user ) )
} )

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
	Notification.requestPermission( ( permission ) => {
	} )
}

store.dispatch( setStatus( !document.hasFocus() ) )

render(
	<div className="container">
		<Provider store={store}>
			<Hud />
		</Provider>
	</div>,
	node
)

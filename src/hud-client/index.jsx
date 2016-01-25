import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import Hud from './ui/hud'
import configureStore from './configureStore'
import logger from 'debug'
import { openRequest, closeRequest, receiveAction, setUser } from './actions'
import socket from './socket'

const debug = logger( 'tardis.hud' )
const store = configureStore()

const node = document.createElement( 'div' )
document.body.appendChild( node )

socket.on( 'connect', () => {
	debug( 'connected' )
} )

socket.on( 'open-request', ( chat, id ) => {
	debug( 'new request opened', chat, id )
	store.dispatch( openRequest( chat, id ) )
} )

socket.on( 'close-request', ( chat, id ) => {
	debug( 'request closed', chat, id )
	store.dispatch( closeRequest( chat, id ) )
} )

socket.on( 'action', ( action ) => {
	debug( 'Received action', action )
	store.dispatch( receiveAction( action ) )
} )

socket.on( 'authorized', ( user ) => {
	store.dispatch( setUser( user ) )
} )

render(
	<div className="container">
		<Provider store={store}>
			<Hud />
		</Provider>
	</div>,
	node
)

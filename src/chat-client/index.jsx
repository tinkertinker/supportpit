import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from './configureStore'
import Client from './ui/client'
import { receiveAction, initChat, identifyUser, updateTeam } from './actions'
import socket from './socket'
import logger from 'debug'

const debug = logger( 'tardis.app' )

const node = document.createElement( 'div' )
document.body.appendChild( node )

const store = configureStore()
const { dispatch } = store

socket.on( 'event', () => {
	debug( 'event', e )
} )

socket.on( 'connect', () => {
	debug( 'connected', socket.id )
} )

socket.on( 'disconnect', () => {
	debug( 'disconnected' )
} )

socket.on( 'reconnect', () => {
	debug( 'reconnected' )
} )

socket.on( 'team', ( team ) => {
	dispatch( updateTeam( team ) )
} )

socket.on( 'init', ( id, user ) => {
	dispatch( initChat( user ) )
	debug( "Initialized", user )
} )

socket.on( 'action', ( action ) => {
	dispatch( receiveAction( action ) )
} )

socket.on( 'identify', () => {
	dispatch( identifyUser() )
} )

render(
	<Provider store={store}>
		<Client />
	</Provider>,
	node
)


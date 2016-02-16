import React from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import configureStore from '../configure-store'
import Client from './ui/client'
import { receiveAction, initChat, identifyUser, updateTeam } from './actions'
import socket from './socket'
import logger from 'debug'
import reducer from './reducers'
import { first, when } from '../react-fn'

const debug = logger( 'tardis.app' )

const node = document.createElement( 'div' )
document.body.appendChild( node )

const store = configureStore( reducer )
const { dispatch } = store

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
	debug( 'Initialized', user )
} )

socket.on( 'action', ( action ) => {
	dispatch( receiveAction( action ) )
} )

socket.on( 'identify', () => {
	dispatch( identifyUser() )
} )

const app = connect( ( props ) => props )( first(
	when( () => true, () => <div>Hello world</div> ),
	( props ) => <Client { ... props } />
) )

render(
	<Provider store={store}>
		{ app }
	</Provider>,
	node
)


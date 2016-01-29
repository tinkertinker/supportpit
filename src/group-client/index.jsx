import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from '../configure-store'
import reducer from './reducer'
import logger from 'debug'
import { get } from '../settings'
import qs from 'querystring'
import socket from './socket'
import { serialize, parse } from 'cookie'
import { get as getProp } from 'lodash/object'
import { isEmpty } from 'lodash/lang'
import Client from './ui/client'
import { sendAuthToken, setUser, setAuthenticationStatus, initRoom, receiveRoomAction, viewRoom } from './actions'

const debug = logger( 'tardis.group' )

let store = configureStore( reducer )

function authorize() {
	// try using the hash if we have one?
	let token = window.location.hash

	let redirectTo = getProp( parse( document.cookie ), 'redirectTo' )
	if ( redirectTo ) {
		history.replaceState( null, null, redirectTo )
	}

	if ( token && token !== '' ) {
		// remove the # and parse the querystring from the hash
		let tokenDetails = qs.parse( token.slice( 1 ) )
		store.dispatch( sendAuthToken( { service: 'wordpress.com', token: tokenDetails } ) )
	} else {
		if ( location.pathname !== '/' ) {
			document.cookie = serialize( 'redirectTo', location.pathname )
			history.replaceState( null, null, '/' )
		}
		store.dispatch( setAuthenticationStatus( 'not-authenticated' ) )
	}
}

socket.on( 'authorize', () => {
	// use the token cookie if we have one

	let session = getProp( parse( document.cookie ), 'token' )
	if ( ! isEmpty( session ) ) {
		socket.emit( 'token', session )
		return
	}

	authorize()
} )

socket.on( 'session', ( { token, user } ) => {
	document.cookie = serialize( 'token', token )
	// if there's a path assume it's the room id
	if ( ! isEmpty( location.pathname ) && location.pathname !== '/' ) {
		socket.emit( 'view-room', location.pathname.slice( 1 ) )
	}

	store.dispatch( setUser( user ) )
} )

socket.on( 'unauthorized', () => {
	document.cookie = serialize( 'token', '' )
	authorize()
} )

socket.on( 'init-room', ( room ) => {
	store.dispatch( initRoom( room ) )
} )

socket.on( 'action', ( id, action ) => {
	store.dispatch( receiveRoomAction( id, action ) )
} )

const node = document.createElement( 'div' )
document.body.appendChild( node )

render( <Provider store={store}><Client /></Provider>, node )

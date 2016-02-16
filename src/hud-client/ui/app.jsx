import React from 'react'

import { connect } from 'react-redux'
import { stringify } from 'querystring'
import { get as getProp } from 'lodash/object'
import { parse } from 'cookie'
import { when, first, each, not } from '../../react-fn'
import { get } from '../../settings'
import Hud from './hud'

const debug = require( 'debug' )( 'tardis:hud:app' )

const redirectURL = `${get( 'auth_url' ) }?${ stringify( { redirect: window.location.toString() } ) }`

export const haveToken = () => getProp( parse( document.cookie ), 'wpcom' )

const gotoAuth = each(
	( e ) => e.preventDefault(),
	() => window.location = redirectURL
)

const login = () => (
	<div>
		<a href="#" onClick={ gotoAuth } >Sign in with WordPress.coms</a>
	</div>
)

const app = first(
	when( not( haveToken ), login ),
	() => <Hud />
)

const log = ( fn ) => ( ... args ) => {
	const result = fn( ... args )
	debug( 'connect', args, result )
	return result
}

export default connect( log( ( props ) => props ) )( app )
export { haveToken as getToken }

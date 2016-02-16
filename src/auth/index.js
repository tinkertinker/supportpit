import express, { static as serveStatic } from 'express'
import { __express as jade } from 'jade'
import cookieParser from 'cookie-parser'
import { normalize, join } from 'path'
import { authURL } from '../wpcom'

const environment = process.env.NODE_ENV || 'development'

const debug = require( 'debug' )( 'tardis:auth:server' )
const app = express()

.engine( 'jade', jade )
.set( 'views', __dirname )
.set( 'view engine', 'jade' )
.use( cookieParser() )
.get( '/', ( req, res ) => {
	// TODO: validate redirect URI
	if ( req.query.redirect ) {
		return res.cookie( 'redirect', req.query.redirect ).redirect( authURL )
	}

	res.render( 'auth' )
} )

if ( environment === 'development' ) {
	// TODO: don't serve the index?
	debug( 'serving webpack middleware' )
	app.use( require( '../../dev' ).middleware )
} else {
	app.use( '/', serveStatic( normalize( join( __dirname, '../../dist' ) ) ) )
}

export { app as default }

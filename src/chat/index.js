import express from 'express'
import { withTeam } from '../teams'
import debug from 'debug'

const log = debug( 'tardis.server' )

let app = express()

// Create a new chat for the customer identified by the token
// returns the URI to be used for the socket-io client.
app.get( '/:token', ( req, res ) => {
	req.team.identify( req.params.token, ( err, user ) => {
		if ( err ) {
			log( err )
			return res.status( 403 ).json( {status: 'Forbidden' } )
		}
		// set the token as a cookie an open the chat page?
		res.cookie( 'token', user.token, { httpOnly: true } )
		res.redirect( '/' )
	} )
} )

export default withTeam( app )

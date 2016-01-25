import express from 'express'
import { register as registerTeam } from '../teams'
import { json as jsonParser } from 'body-parser'

const app = express()

app.get( '/', ( req, res ) => {
	res.json( { status: 'running' } )
} )

app.post( '/team', jsonParser(), ( req, res ) => {
	registerTeam( req.body.host, req.body.endpoint, ( e, team ) => {
		if ( e ) {
			return res.status( 400 ).json( { error: e } )
		}
		res.json( { team } )
	} )
} )

export default app

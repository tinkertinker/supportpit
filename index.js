import express, { static as serveStatic } from 'express'
import http from 'http'
import logger from 'debug'
import subdomain from './src/subdomain'
import admin from './src/admin'
import chat from './src/chat'
import teams, { withTeam } from './src/teams'
import chatServer from './src/chat-server'

const debug = logger( 'tardis.server' )
const environment = process.env.NODE_ENV || 'development'

debug( 'Starting tardis in:', environment )

let app = express()

app.use( subdomain( 'admin', admin ) )

// Team Management
app.use( '/team', teams )

// For initializing a chat for a customer
app.use( '/open', chat )

let server = http.createServer( app )

chatServer( server )

if ( environment === 'development' ) {
	app.use( withTeam( require( './dev' ).middleware ) )
	app.use( subdomain( 'chat', require( './dev' ).middleware ) )
} else {
	app.use( '/', withTeam( serveStatic( './dist/' ) ) )
	app.use( '/', subdomain( 'chat', serveStatic( './dist/' ) ) )
}

server.listen( process.env.PORT || 3000, () => {
	let { address, port, family } = server.address()
	debug( `Listening on ${family} ${address}:${port}` )
} )

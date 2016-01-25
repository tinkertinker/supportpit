import express from 'express'
import http from 'http'
import debug from 'debug'
import hostname from './src/hostname'
import admin from './src/admin'
import chat from './src/chat'
import teams, { withTeam } from './src/teams'
import chatServer from './src/chat-server'

const log = debug( 'tardis.server' )

let app = express()

app.use( hostname( 'admin.tardis.localhost', admin ) )

// Team Management
app.use( '/team', teams )

// For initializing a chat for a customer
app.use( '/open', chat )

let server = http.createServer( app )

chatServer( server )

if ( process.env.NODE_ENV === 'development' ) {
	app.use( '/chat', withTeam( require( './dev' ).middleware ) )
	app.use( '/hud', withTeam( require( './hud' ).middleware ) )
}

server.listen( process.env.PORT || 3000, () => {
	let { address, port, family } = server.address()
	log( `Listening on ${family} ${address}:${port}` )
} )

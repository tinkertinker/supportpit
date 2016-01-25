import Team from './team'
import api from './api'
import express from 'express'
import logger from 'debug'
const debug = logger( 'tardis.teams' )

let TEAMS = [
	new Team( 'a8c', 'http://localhost:4004/tardis' )
]

export { Team }

export function forHost( host, cb ) {
	debug( 'looking for team matching host:', host )
	process.nextTick( () => {
		let team = TEAMS.find( ( t ) => host === t.host )
		let error = null
		if ( !team ) {
			error = new Error( 'Team does not exist' )
		}
		cb( error, team )
	} )
}

export function forRequest( req, cb ) {
	forHost( req.subdomains[0], cb )
}

// A chat client is being connected, determine which team it is for
// based on the hostname
export function forSocket( socket, cb ) {
	const { host } = socket.request.headers
	const [ domain, ] = host.split( ':' )
	const subdomains = domain.split( '.' ).slice( 0, -2 )
	forHost( subdomains[0], cb )
}

export function register( host, endpoint, cb ) {
	process.nextTick( () => {
		let team = new Team( host, endpoint )
		TEAMS.push( team )
		cb( null, team )
	} )
}

export function withTeam( fn ) {
	return function( req, res, next ) {
		forRequest( req, function( err, team ) {
			if ( err || !team ) {
				return next()
			}
			req.team = res.team = team
			fn( req, res, next )
		} )
	}
}

export default express().use( '/api', withTeam( api ) )

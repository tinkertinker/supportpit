import express from 'express'

const api = express()

api.get( '/', ( req, res ) => {
	const { team } = req
	res.json( { team } )
} )

api.get( '/members', ( req, res ) => {
	const { team } = req
	team.members( ( e, members ) => {
		res.json( { team, members } )
	} )
} )

export default api

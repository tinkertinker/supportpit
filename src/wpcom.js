import https from 'https'
import logger from 'debug'
import { stringify } from 'querystring'

import { get } from './settings'

const debug = logger( 'tardis.wpcom' )

export function identify( { token }, callback ) {
	return identifyToken( token.access_token, callback )
}

export function identifyToken( access_token, callback ) {
	const promise = new Promise( ( resolve, reject ) => {
		https.request( {
			method: 'GET',
			host: 'public-api.wordpress.com',
			path: `/rest/v1/me`,
			headers: { Authorization: `Bearer ${ access_token }`}
		} )
		.on( 'response', ( response ) => {
			debug( 'response', response.statusCode )
			let data = ''
			response
			.on( 'error', reject )
			.on( 'data', ( d ) => data += d )
			.on( 'end', () => resolve( JSON.parse( data ) ) )
		} )
		.on( 'error', reject )
		.end()
	} )

	if ( callback ) {
		return promise
			.then( ( result ) => callback( undefined, result ) )
			.catch( callback )
	}

	return promise
}

const QUERY_PARAMS = stringify( {
	client_id: get( 'wordpresscom.client_id' ),
	redirect_uri: get( 'wordpresscom.redirect_uri' ),
	response_type: 'token'
} )

export const authURL = `https://public-api.wordpress.com/oauth2/authorize?${QUERY_PARAMS}`

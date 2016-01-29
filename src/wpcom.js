import https from 'https'
import logger from 'debug'

const debug = logger( 'tardis.wpcom' )

export function identify( auth_details, callback ) {
	const request = https.request( {
		method: 'GET',
		host: 'public-api.wordpress.com',
		path: `/rest/v1/me`,
		headers: { Authorization: `Bearer ${ auth_details.token.access_token }`}
	} )
	request
	.on( 'response', ( response ) => {
		debug( 'response', response.statusCode )
		let data = ''
		response
		.on( 'error', callback )
		.on( 'data', ( d ) => data += d )
		.on( 'end', () => callback( null, JSON.parse( data ) ) )
	} )
	.on( 'error', callback )
	.end()
}

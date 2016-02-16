import { get as getProp } from 'lodash/object'

const debug = require( 'debug' )( 'tardis.settings' )

let config = {}

try {
	config = require( '../local.config.js' )
} catch ( e ) {
	config = JSON.parse( process.env.TARDIS_CONFIG || {} )
	debug( 'Failed to load local config, falling back to', config )
}

export function get( key, missing = undefined ) {
	return getProp( config, key, missing )
}

import logger from 'debug'
const debug = logger( 'tardis.settings' )

let config = {}

try {
	config = require( '../local.config.js' )
} catch ( e ) {
	debug( 'Failed to load local config, falling back to', config )
}

export function get( key, missing = undefined ) {
	if ( config[key] === undefined ) {
		if ( missing === undefined ) {
			debug( `Missing setting ${key}` )
		}
		return missing
	}
	return config[key]
}

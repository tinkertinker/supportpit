import { parse as parseCookie, serialize } from 'cookie'
import { parse as parseQuery } from 'querystring'

const debug = require( 'debug' )( 'tardis:auth:client' )

const { redirect } = parseCookie( document.cookie )
const authDetails = parseQuery( window.location.hash.slice( 1 ) )
const domain = '.' + window.location.hostname.split( '.' ).slice( 1 ).join( '.' )

debug( 'using domain', domain )

document.cookie = serialize( 'wpcom', authDetails.access_token, { domain } )

window.location = redirect

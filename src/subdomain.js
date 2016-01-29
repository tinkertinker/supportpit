export default function subdomain( sub, cb ) {
	return function( req, res, next ) {
		if ( sub === req.subdomains[0] ) {
			return cb( req, res, next )
		}
		next()
	}
}

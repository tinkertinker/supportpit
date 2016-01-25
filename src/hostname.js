export default function host( hostname, cb ) {
	return function( req, res, next ) {
		if ( hostname === req.hostname ) {
			return cb( req, res, next )
		}
		next()
	}
}

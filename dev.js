import path from 'path'
import express from 'express'
import webpack from 'webpack'
import config from './webpack.config.dev'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import log from 'debug'

const debug = log( 'tardis.dev' )

let app = express();
let compiler = webpack( config );

app.use( devMiddleware( compiler, {
	publicPath: '/',
	noInfo: false,
	quiet: false
} ) );

app.use( hotMiddleware( compiler ) );

app.get( '*', ( req, res ) => {
	let fs = compiler.outputFileSystem
	res.set( 'Content-Type', 'text/html' );
	const filePath = path.join( __dirname, 'dist', 'index.html' )
	debug( 'Serving static file', filePath )
	res.send( compiler.outputFileSystem.readFileSync( filePath ) )
} );

export { app as middleware, compiler }

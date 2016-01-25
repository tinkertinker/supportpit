import path from 'path'
import express from 'express'
import webpack from 'webpack'
import config from './webpack.chat.dev'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'

let app = express();
let compiler = webpack( config );

app.use( devMiddleware( compiler, {
	noInfo: true,
	publicPath: config.output.publicPath
} ) );

app.use( hotMiddleware( compiler ) );

app.get( '*', ( req, res ) => {
	res.set( 'Content-Type', 'text/html' );
	res.send( compiler.outputFileSystem.readFileSync( path.join( __dirname, 'dist', 'index.html' ) ) );
} );

export { app as middleware }

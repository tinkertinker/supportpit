import 'babel-register'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import baseConfig from './webpack.config.js'

module.exports = Object.assign( {}, baseConfig, {
	devtool: 'sourcemap',
	entry: Object.assign( {}, {
		'webpack-hot-middleware/client': 'webpack-hot-middleware/client',
		'webpack-hot-middleware/client?path=/__webpack_hmr': 'webpack-hot-middleware/client?path=/__webpack_hmr',
		'webpack/hot/dev-server': 'webpack/hot/dev-server'
	}, baseConfig.entry ),
	plugins: [
		new HtmlWebpackPlugin( { title: 'Chat', filename: 'chat.html', chunks: [ 'chat' ] } ),
		new HtmlWebpackPlugin( { title: 'HUD', filename: 'hud.html', chunks: [ 'hud' ] } ),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	]
} );

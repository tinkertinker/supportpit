import 'babel-register'
import webpack from 'webpack'
import baseConfig from './webpack.config.js'

module.exports = Object.assign( {}, baseConfig, {
	devtool: 'sourcemap',
	entry: Object.assign( {}, {
		'webpack-hot-middleware/client': 'webpack-hot-middleware/client',
		'webpack-hot-middleware/client?path=/__webpack_hmr': 'webpack-hot-middleware/client?path=/__webpack_hmr',
		'webpack/hot/dev-server': 'webpack/hot/dev-server'
	}, baseConfig.entry ),
	plugins: baseConfig.plugins.concat( [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	] )
} );

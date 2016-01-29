const path = require( 'path' );
const autoprefixer = require( 'autoprefixer' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

module.exports = {
	context: __dirname + '/src',
	devtool: 'sourcemap',
	entry: {
		chat: './chat-client',
		hud: './hud-client',
		group: './group-client'
	},
	output: {
		path: path.join( __dirname + '/dist' ),
		filename: '[name].js'
	},
	module: {
		preLoaders: [
			{ test: /\.jsx?$/, exclude: /node_modules/, loaders: [ 'eslint-loader' ] }
		],
		loaders: [
			{ test: /\.jsx?$/, exclude: /node_modules/, loaders: [ 'babel-loader' ] },
			{ test: /\.json$/, loader: 'json-loader'},
			{ test: /\.scss$/, loader: 'style-loader!css-loader!postcss-loader!sass-loader'}
		]
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.json', '.scss', '.css' ],
		moduleDirectories: [ 'lib', 'node_modules' ]
	},
	plugins: [
		new HtmlWebpackPlugin( { title: 'Chat', filename: 'chat.html', chunks: [ 'chat' ] } ),
		new HtmlWebpackPlugin( { title: 'HUD', filename: 'hud.html', chunks: [ 'hud' ] } ),
		new HtmlWebpackPlugin( { title: 'Group', filename: 'index.html', chunks: [ 'group' ] } )
	],
	postcss: [ autoprefixer() ]
};

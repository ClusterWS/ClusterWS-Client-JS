var path = require('path');
var webpack = require('webpack');
var env = process.env.WEBPACK_ENV;

var fileEnd = '.js';
var plugins = [];
if(env === 'production'){
    fileEnd = '.min.js';
    plugins = [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: true,
            compress: {
                warnings: false, // Suppress uglification warnings
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                screw_ie8: true
            }
        })
    ];
}

module.exports = {
    entry: {
        'ClusterWS': './src/index.ts'
    },
    resolve: {
        extensions: [".ts"]
    },
    output: {
        path: path.join(__dirname, '/dist/browser'),
        filename: '[name]' + fileEnd,
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: plugins
};
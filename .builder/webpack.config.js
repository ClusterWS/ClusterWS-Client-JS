const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const env = process.env.WEBPACK_ENV

let folder = ''
let fileName = '[name]'
let plugins = [new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' })]


let time = Math.floor(Math.random() * (1000 + 1))

if (env === 'min') {
    folder = "/browser"
    fileName = 'ClusterWS.min'
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        compress: {
            warnings: false,
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            screw_ie8: true
        }
    }))
} else if (env === 'notmin') {
    folder = "/browser"
    fileName = 'ClusterWS'
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        comments: false,
        beautify: true
    }))
} else {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        comments: false,
        beautify: true
    }))
}

const configs = {
    entry: {
        'index': './src/index.ts'
    },
    resolve: {
        extensions: [".ts"]
    },
    output: {
        path: path.join(__dirname, '../dist' + folder),
        filename: fileName + '.js',
        libraryTarget: 'umd'
    },
    externals: [nodeExternals()],
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'tslint-loader',
                options: {
                    configFile: path.join(__dirname, './tslint.json'),
                    typeCheck: true,
                    tsConfigFile: path.join(__dirname, './tsconfig.json')
                }
            },
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: path.join(__dirname, './tsconfig.json')
                }
            }
        ]
    },
    plugins: plugins
}

module.exports = configs
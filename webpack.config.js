const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyPkgJsonPlugin = require("copy-pkg-json-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const exec = require('child_process').exec;

const env = process.env.WEBPACK_ENV;

// Make git tag be the same version as project
const version = require('./package.json').version;
exec("git tag -a " + version + " -m \"Update version\"", function (err, stdout, stderr) {
});

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

var fileStart = '[name]';
var fileEnd = '.js';
var folder = '/browser';

var plugins = [];

if (env === 'prod') {
    fileEnd = '.min.js';

    plugins.push(new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        compress: {
            warnings: false, // Suppress uglification warnings
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            screw_ie8: true
        }
    }));
}

if (env === 'npm') {
    fileStart = 'index';
    folder = '/npm';
    plugins.push(new CopyPkgJsonPlugin({
        remove: ['devDependencies', 'scripts']
    }));
    plugins.push(new CopyWebpackPlugin([{from: 'README.md'}]))
}

if (env === 'npm' || env === 'prod') {
    plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }));

}

module.exports = {
    entry: {
        'ClusterWS': './src/index.ts'
    },
    resolve: {
        extensions: [".ts"]
    },
    output: {
        path: path.join(__dirname, '/dist' + folder),
        filename: fileStart + fileEnd,
        libraryTarget: 'umd'
    },
    externals: nodeModules,
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
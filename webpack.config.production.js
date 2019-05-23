'use strict'

var webpack = require('webpack')
// var webpackTargetElectronRenderer = require('webpack-target-electron-renderer')
var baseConfig = require('./webpack.config.base')

var config = Object.assign({}, baseConfig)

config.mode = 'production';

config.devtool = 'source-map'

config.entry = './app/index'

config.output.publicPath = '/dist/'

/*
config.module.loaders.push({
  test: /^((?!\.module).)*\.css$/,
  loader: ExtractTextPlugin.extract(
    'style-loader',
    'css-loader'
  )
}, {
  test: /\.module\.css$/,
  loader: ExtractTextPlugin.extract(
    'style-loader',
    'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
  )
})
*/

config.plugins.push(
  // new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })
)

config.target = 'electron-renderer'

module.exports = config

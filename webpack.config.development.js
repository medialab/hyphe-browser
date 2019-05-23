'use strict';

var webpack = require('webpack')
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer')
var baseConfig = require('./webpack.config.base')


var config = Object.assign({}, baseConfig)

config.mode = 'development'

config.devtool = 'cheap-module-eval-source-map'

config.entry = [
  'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
  './app/index'
]

config.output.publicPath = 'http://localhost:3000/dist/'

config.plugins.push(
  new webpack.NamedModulesPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': true,
    'process.env': {
      'NODE_ENV': JSON.stringify('development'),
      'DIRECT_ACCESS_CORPUS_TEST': JSON.stringify(process.env.DIRECT_ACCESS_CORPUS_TEST)
    }
  })
)

config.target = 'electron-renderer'

module.exports = config

'use strict'

var path = require('path')

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
              babelrc: true
          },
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      // {
      //   test: /\.json$/,
      //   loaders: ['json']
      // },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg|gif|jpg|jpeg)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.styl$/,
        loaders: ['style-loader', 'css-loader', 'stylus-loader']
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: { 
      'react-dom': '@hot-loader/react-dom'  
    }, 
    extensions: [ '.js', '.jsx', '.json', '.css', '.styl'],
    // packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },
  plugins: [

  ],
  externals: [
    // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
  ],
}

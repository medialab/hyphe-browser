'use strict'

var path = require('path')
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.config.development')

var app = express()
var compiler = webpack(config)

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}))

app.use(require('webpack-hot-middleware')(compiler))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'index-dev.html'))
})

app.listen(3000, 'localhost', (err) => {
  if (err) {
    console.error(err) // eslint-disable-line no-console
    process.exit(1)
  }

  console.log('Listening at http://localhost:3000') // eslint-disable-line no-console
})

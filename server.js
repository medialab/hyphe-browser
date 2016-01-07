var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.development');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'app', 'hot-dev-app.html'));
});

app.listen(3000, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});


require('http').createServer(function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><head><title>Tests</title></head><body><ul>'
    + '<li><a href="http://google.fr">normal link</a></li>'
    + '<li><a href="http://google.fr" target="_blank">target=_blank</a></li>'
    + '<li><a href="http://google.fr" target="lol">target=lol</a></li>'
    + '<li><a href="#" onclick="window.open(\'http://google.com\')">window.open</a></li>'
    + '<li><a href="#" onclick="foo(42)">foo</a></li>'
    + '<li><a href="#" onclick="alert(42)">alert</a></li>'
  + '</ul></body></html>');
}).listen(3001);

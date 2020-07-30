const webpack = require('webpack')

module.exports = {

  mode: 'development',

  target: 'electron-main',

  entry: './app/index.js',

  output: {
    path: __dirname + '/dist',
    publicPath: 'http://localhost:3000/dist/',
    filename: 'bundle.js',
  },

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
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader'
          },
          {
            loader: 'markdown-loader'
          }
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg|gif|jpg|jpeg)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader'
      }
    ]
  },

  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ],

  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    },
    extensions: ['.js', '.json', '.jsx', '.styl', 'css']
  }

}

// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

module.exports = {
  plugins: [
    // your custom plugins
  ],
  module: {
    rules: [
      // add your custom rules.
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
    ],
  },
};

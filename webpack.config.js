var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: [
    './polyfillCheck.js',
    './handler.js'
  ],
  target: 'node',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: __dirname,
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: "json",
        include: __dirname
      }
    ]
  },
  externals: ['aws-sdk', nodeExternals()]
};

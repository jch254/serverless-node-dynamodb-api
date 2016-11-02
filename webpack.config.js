var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: [
    path.join(__dirname, 'handler.js'),
  ],
  output: {
    path: path.join(__dirname, '.webpack'),
    filename: 'handler.js',
    libraryTarget: 'commonjs'
  },
  target: 'node',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
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

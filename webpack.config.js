var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: [
    path.join(__dirname, 'src/handler.js'),
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
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        include: path.join(__dirname, 'src'),
      }
    ]
  },
  externals: ['aws-sdk', nodeExternals()]
};

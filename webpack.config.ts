import path = require('path');
import webpack = require('webpack');
import nodeExternals = require('webpack-node-externals');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    path.join(__dirname, 'src', 'index.ts'),
  ],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: 'src/index.js',
  },
  target: 'node',
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [
      path.join(__dirname, 'src'),
      path.join(__dirname, 'node_modules'),
    ],
  },
  externals: ['aws-sdk', nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: ['tslint-loader'],
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.(js|ts)$/,
        include: path.join(__dirname, 'src'),
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            silent: true,
          },
        }],
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        include: path.join(__dirname, 'src'),
        enforce: 'pre',
      },
    ],
  },
};

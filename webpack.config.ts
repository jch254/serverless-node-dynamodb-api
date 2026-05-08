import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path = require('path');
import slsw = require('serverless-webpack');

const srcPath = path.join(__dirname, 'src');
module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  devtool: 'cheap-module-source-map',
  entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: 'src/index.js',
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
  ],
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    conditionNames: ['node', 'require'],
    mainFields: ['main'],
    modules: [srcPath, 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        include: srcPath,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        include: srcPath,
        enforce: 'pre',
      },
    ],
  },
};

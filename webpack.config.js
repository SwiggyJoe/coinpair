var debug = process.env.NODE_ENV !== "production";
debug = true;
var webpack = require('webpack');
var path = require('path');
var WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  context: path.join(__dirname, "src"),
  devtool: debug ? "inline-sourcemap" : false,
  devServer: {
    historyApiFallback: true,
  },
  entry: ['babel-polyfill', './js/client.js'],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude:  /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'env', 'stage-0'],
          plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],

        }
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
         ]
      }
    ]
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: "client.min.js"
  },
  plugins: debug ? [
      new WriteFilePlugin()
  ] : [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
      new WriteFilePlugin()
    ],
};

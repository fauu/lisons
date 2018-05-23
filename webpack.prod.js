const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const common = require("./webpack.common");

module.exports = merge(common.config, {
  mode: "production",
  entry: ["babel-polyfill", common.entry],
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJsPlugin({ parallel: true })
  ]
});

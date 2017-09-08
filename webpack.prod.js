const path = require("path")
const webpack = require("webpack")
const merge = require("webpack-merge")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const common = require("./webpack.common")

const mainConfig = merge(common.mainConfig, {
  node: {
    __dirname: false
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
})

const rendererConfig = merge(common.rendererConfig, {
  entry: ["babel-polyfill", common.rendererEntry],
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({ template: common.htmlTemplatePath })
  ]
})

module.exports = [mainConfig, rendererConfig]

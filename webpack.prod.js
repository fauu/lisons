const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const BabelPlugin = require("babel-webpack-plugin")
const common = require("./webpack.common")

const mainConfig = {
  target: common.mainConstants.target,
  entry: common.mainConstants.entry,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
        exclude: /node_modules/
      }
    ]
  },
  output: common.mainConstants.output,
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new BabelPlugin({
      test: /\.js$/,
      sourceMaps: false,
      compact: true,
      minified: true,
      comments: false,
      presets: ["minify"]
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  node: {
    __dirname: false
  }
}

const rendererConfig = {
  entry: common.rendererConstants.entry,
  output: {
    filename: common.rendererConstants.outputFilename,
    path: common.rendererConstants.outputPath
  },
  devtool: "cheap-module-source-map",
  module: common.rendererConstants.module,
  resolve: common.rendererConstants.resolve,
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new BabelPlugin({
      test: /\.js$/,
      sourceMaps: true,
      compact: true,
      minified: true,
      comments: false,
      presets: ["minify"]
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: common.htmlTemplatePath
    })
  ]
}

module.exports = [mainConfig, rendererConfig]

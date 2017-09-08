const path = require("path")
const webpack = require("webpack")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const common = require("./webpack.common")

const mainConfig = {
  target: "electron-main",
  entry: common.mainConstants.entry,
  output: common.mainConstants.output,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["babel-loader", "ts-loader"],
        include: common.srcPath
      }
    ]
  },
  resolve: common.mainConstants.resolve,
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  node: {
    __dirname: false
  }
}

const rendererConfig = {
  target: "electron-renderer",
  entry: ["babel-polyfill", common.rendererConstants.entry],
  output: {
    filename: common.rendererConstants.outputFilename,
    path: common.rendererConstants.outputPath
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: "babel-loader" },
          { loader: "ts-loader", options: { transpileOnly: true } }
        ],
        include: common.rendererConstants.srcPath
      }
    ]
  },
  resolve: common.rendererConstants.resolve,
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: common.htmlTemplatePath
    }),
    new ForkTsCheckerWebpackPlugin()
  ]
}

module.exports = [mainConfig, rendererConfig]

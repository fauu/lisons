const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const merge = require("webpack-merge");

const common = require("./webpack.common");

const devServerHost = "localhost";
const devServerPort = 3000;
const devServerUrl = `http://${devServerHost}:${devServerPort}/`;

const config = merge(common.config, {
  mode: "development",
  entry: [
    "babel-polyfill",
    `webpack-dev-server/client?${devServerUrl}`,
    "webpack/hot/only-dev-server",
    common.entry
  ],
  output: {
    publicPath: common.devServerUrl
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("dev")
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(path.join(__dirname, common.dllConfig.vendorManifestRelativePath))
    }),
    new AddAssetHtmlPlugin({
      filepath: common.dllConfig.vendorBundleRelativePath,
      includeSourcemap: false
    })
    //new BundleAnalyzerPlugin()
  ],
  devServer: {
    host: devServerHost,
    port: devServerPort,
    contentBase: path.join(__dirname, common.outDirName),
    hot: true
  }
});

module.exports = config;

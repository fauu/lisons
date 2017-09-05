const path = require("path");
const webpack = require("webpack");
const BabelPlugin = require("babel-webpack-plugin");

const mainConfig = {
  target: "electron-main",
  entry: { main: "./src/main.ts" },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["babel-loader", "ts-loader"],
        exclude: /node_modules/
      }
    ]
  },
  output: {
    filename: "main.bundle.js",
    path: path.resolve(__dirname, "out")
  },
  plugins: [
    new BabelPlugin({
      test: /\.js$/,
      sourceMaps: true,
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
};

const rendererConfig = {
  entry: "./src/renderer.tsx",
  output: {
    filename: "renderer.bundle.js",
    path: path.resolve(__dirname, "out"),
    publicPath: "/"
  },
  devtool: "cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["babel-loader", "ts-loader"],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
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
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
};

module.exports = [mainConfig, rendererConfig];

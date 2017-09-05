var path = require("path");
var webpack = require("webpack");

const rendererConfig = {
  entry: [
    "react-hot-loader/patch",
    "webpack-dev-server/client?http://localhost:3000",
    "webpack/hot/only-dev-server",
    "./src/renderer.tsx"
  ],
  output: {
    filename: "renderer.bundle.js",
    path: path.resolve(__dirname, "out"),
    publicPath: "http://localhost:3000/out/"
  },
  devtool: "inline-source-map",
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  devServer: {
    host: "localhost",
    port: 3000,
    hot: true
  }
};

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
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development")
      }
    })
  ]
};

const isDevServer = process.argv.find(v => v.includes("webpack-dev-server"));

module.exports = isDevServer ? rendererConfig : mainConfig;

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
    publicPath: "http://localhost:3000/"
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
    contentBase: "out",
    port: 3000,
    hot: true
  }
};

const templateContent = () => {
  const scriptTag =
    '<script type="text/javascript" src="http://localhost:3000/renderer.bundle.js"></script>';
  const html = fs
    .readFileSync(path.resolve(process.cwd(), "src/index.html"))
    .toString();
  const bodyClosingStart = html.indexOf("</body>");
  return `
    ${html.substring(0, bodyClosingStart)}
    ${scriptTag}
    ${html.substring(bodyClosingStart)}
  `;
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
    }),
    new HtmlWebpackPlugin({
      templateContent: templateContent(),
      inject: false
    })
  ]
};

const isDevServer = process.argv.find(v => v.includes("webpack-dev-server"));

module.exports = isDevServer ? rendererConfig : mainConfig;

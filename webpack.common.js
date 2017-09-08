const path = require("path")
const webpack = require("webpack")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")

const outDirName = "out"
const outPath = path.resolve(__dirname, outDirName)
const srcDirName = "src"
const srcPath = path.resolve(__dirname, srcDirName)
const htmlTemplatePath = path.join(srcDirName, "index.html")
const rendererEntry = "./src/renderer.tsx"

const rendererConfig = {
  target: "electron-renderer",
  output: {
    filename: "renderer.bundle.js",
    path: outPath
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: "babel-loader" },
          { loader: "ts-loader", options: { transpileOnly: true } }
        ],
        include: srcPath
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
      "~": path.resolve("./src")
    },
    symlinks: false
  },
  plugins: [new webpack.NoEmitOnErrorsPlugin(), new ForkTsCheckerWebpackPlugin()]
}

const mainConfig = {
  target: "electron-main",
  entry: { main: "./src/main.ts" },
  output: {
    filename: "main.bundle.js",
    path: outPath
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["babel-loader", "ts-loader"],
        include: srcPath
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts"],
    symlinks: false
  }
}

module.exports = {
  mainConfig,
  rendererConfig,
  outDirName,
  srcPath,
  htmlTemplatePath,
  rendererEntry
}

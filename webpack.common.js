const path = require("path")
const webpack = require("webpack")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const HappyPack = require("happypack")
const packageJson = require("./package.json")

const outDirName = "out"
const outPath = path.resolve(__dirname, outDirName)
const srcDirName = "src"
const srcPath = path.resolve(__dirname, srcDirName)
const staticResPath = "./src/res/static"
const browserIconPath = "./build/icons/128x128.png"
const browserIconOutFilename = "icon.png"
const htmlTemplatePath = path.join(srcDirName, "index.html")
const rendererEntry = "./src/renderer.tsx"

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
        test: /.ts$/,
        use: ["babel-loader", "ts-loader"],
        include: srcPath
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".json"],
    alias: {
      "~": path.resolve("./src")
    },
    symlinks: false
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: staticResPath },
      { from: browserIconPath, to: browserIconOutFilename }
    ])
  ]
}

const rendererConfig = {
  context: __dirname,
  target: "electron-renderer",
  output: {
    filename: "renderer.bundle.js",
    path: outPath
  },
  module: {
    rules: [
      {
        test: /tsx?$/,
        loader: "happypack/loader?id=ts"
      },
      {
        test: /(png|jpg|gif|woff2)$/,
        loaders: "url-loader?limit=100000"
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
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageJson.version)
    }),
    new HappyPack({
      id: "ts",
      threads: 2,
      loaders: [
        {
          path: "babel-loader"
        },
        {
          path: "ts-loader",
          query: { happyPackMode: true }
        }
      ]
    }),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
}

module.exports = {
  mainConfig,
  rendererConfig,
  outDirName,
  srcPath,
  htmlTemplatePath,
  rendererEntry
}

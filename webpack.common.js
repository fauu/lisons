const path = require("path")

// TODO: use webpack-merge

const outDirName = "out"
const outPath = path.resolve(__dirname, outDirName)
const htmlTemplatePath = "src/index.html"

const mainConstants = {
  target: "electron-main",
  entry: { main: "./src/main.ts" },
  output: {
    filename: "main.bundle.js",
    path: outPath
  }
}

const rendererConstants = {
  entry: "./src/renderer.tsx",
  outputFilename: "renderer.bundle.js",
  outputPath: outPath,
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
  }
}

module.exports = {
  outDirName,
  htmlTemplatePath,
  mainConstants,
  rendererConstants
}
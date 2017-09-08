const path = require("path")

// TODO: use webpack-merge

const outDirName = "out"
const outPath = path.resolve(__dirname, outDirName)
const srcDirName = "src"
const srcPath = path.resolve(__dirname, srcDirName)
const htmlTemplatePath = path.join(srcDirName, "index.html")

const mainConstants = {
  target: "electron-main",
  entry: { main: "./src/main.ts" },
  output: {
    filename: "main.bundle.js",
    path: outPath
  },
  resolve: {
    extensions: [".js", ".ts"]
  }
}

const rendererConstants = {
  target: "electron",
  entry: "./src/renderer.tsx",
  outputFilename: "renderer.bundle.js",
  outputPath: outPath,
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
    }
  }
}

module.exports = {
  outDirName,
  srcPath,
  htmlTemplatePath,
  mainConstants,
  rendererConstants
}

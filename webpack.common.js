const path = require("path");
const webpack = require("webpack");
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HappyPack = require("happypack");
const packageJson = require("./package.json");

const outDirName = "out";
const outPath = path.resolve(__dirname, outDirName);
const srcDirName = "src";
const srcPath = path.resolve(__dirname, srcDirName);
const staticResPath = "./src/res/static";
const browserIconPath = "./build/icons/128x128.png";
const browserIconOutFilename = "icon.png";
const htmlTemplatePath = path.join(srcDirName, "index.html");
const entryFilename = "./src/index.tsx";
const dllConfig = {
  dllRelativePath: "./dll",
  vendorBundleFilename: "vendor.bundle.js",
  vendorManifestFilename: "vendor-manifest.json"
};

// module: {
//   rules: [
//     {
//       test: /.ts$/,
//       use: ["cache-loader", "babel-loader", "ts-loader"],
//       include: srcPath
//     }
//   ]
// },

// plugins: [
//   new CopyWebpackPlugin([
//     { from: staticResPath },
//     { from: browserIconPath, to: browserIconOutFilename }
//   ])
// ]

const config = {
  context: __dirname,
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
        loader: "url-loader?limit=100000"
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
        "cache-loader",
        "babel-loader",
        {
          path: "ts-loader",
          query: { happyPackMode: true }
        }
      ]
    }),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true, watch: ["./src"] }),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new AddAssetHtmlPlugin({ filepath: "./dll/vendor.bundle.js", includeSourcemap: false })
  ]
};

module.exports = {
  config,
  outDirName,
  srcPath,
  htmlTemplatePath,
  entryFilename,
  dllConfig
};

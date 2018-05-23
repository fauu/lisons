const path = require("path");
const webpack = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HappyPack = require("happypack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const packageJson = require("./package.json");

const bundleFilename = "main.bundle.js";
const outDirName = "out";
const outPath = path.resolve(__dirname, outDirName);
const srcDirName = "src";
const staticResPath = "./src/res/static"; // TODO: Move out of `src`?
const browserIconPath = "./build/icons/128x128.png";
const browserIconOutFilename = "icon.png";
const htmlTemplatePath = path.join(srcDirName, "index.html");
const entry = "./src/index.tsx";

const dllRelativePath = "./dll";
const vendorBundleFilename = "vendor.bundle.js";
const vendorManifestFilename = "vendor-manifest.json";
const dllConfig = {
  dllRelativePath,
  vendorBundleFilename,
  vendorBundleRelativePath: path.join(dllRelativePath, vendorBundleFilename),
  vendorManifestFilename,
  vendorManifestRelativePath: path.join(dllRelativePath, vendorManifestFilename)
};

const config = {
  context: __dirname,
  output: {
    filename: bundleFilename,
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
      "~": path.resolve(srcDirName)
    },
    symlinks: false
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageJson.version)
    }),
    new CopyWebpackPlugin([
      { from: staticResPath },
      { from: browserIconPath, to: browserIconOutFilename }
    ]),
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
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true, watch: [srcDirName] }),
    new HtmlWebpackPlugin({
      template: htmlTemplatePath
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};

module.exports = {
  config,
  outDirName,
  entry,
  dllConfig
};

const path = require("path")
const webpack = require("webpack")

const common = require("./webpack.common")

module.exports = {
  context: process.cwd(),
  mode: "development",
  resolve: {
    modules: [__dirname, "node_modules"]
  },
  entry: {
    library: [
      "core-js",
      "franc-min",
      "kuromoji",
      "lodash",
      "mdi-react",
      "mobx",
      "mobx-react",
      "mobx-utils",
      "react",
      "react-css-transition-replace",
      "react-dom",
      "styled-components"
    ]
  },
  output: {
    filename: common.dllConfig.vendorBundleFilename,
    path: path.resolve(__dirname, common.dllConfig.dllRelativePath),
    library: "vendor_lib"
  },
  plugins: [
    new webpack.DllPlugin({
      name: "vendor_lib",
      path: path.join(
        __dirname,
        common.dllConfig.dllRelativePath,
        common.dllConfig.vendorManifestFilename
      )
    })
  ]
}

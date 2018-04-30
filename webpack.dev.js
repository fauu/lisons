const fs = require("fs")
const path = require("path")
const webpack = require("webpack")
const merge = require("webpack-merge")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const common = require("./webpack.common")

const mode = "development"
const devServerHost = "localhost"
const devServerPort = 3000
const devServerUrl = `http://${devServerHost}:${devServerPort}/`

const templateContent = () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), common.htmlTemplatePath)).toString()
  const bodyClosingStart = html.indexOf("</body>")
  return `
    ${html.substring(0, bodyClosingStart)}
    <script
       type="text/javascript"
       src="${devServerUrl}${common.dllConfig.vendorBundleFilename}">
    </script>
    <script
       type="text/javascript"
       src="${devServerUrl}${common.rendererConfig.output.filename}">
    </script>
    ${html.substring(bodyClosingStart)}
  `
}

const mainConfig = merge(common.mainConfig, {
  mode: mode,
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("dev")
      }
    }),
    new HtmlWebpackPlugin({
      templateContent: templateContent(),
      inject: false
    })
  ]
})

const rendererConfig = merge(common.rendererConfig, {
  mode: mode,
  entry: [
    "babel-polyfill",
    `webpack-dev-server/client?${devServerUrl}`,
    "webpack/hot/only-dev-server",
    common.rendererEntry
  ],
  output: {
    publicPath: common.devServerUrl
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(
          __dirname,
          common.dllConfig.dllRelativePath,
          common.dllConfig.vendorBundleFilename
        )
      }
    ]),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(path.join(
        __dirname,
        common.dllConfig.dllRelativePath,
        common.dllConfig.vendorManifestFilename
      ))
    })
    //new BundleAnalyzerPlugin()
  ],
  devServer: {
    host: devServerHost,
    port: devServerPort,
    contentBase: path.join(__dirname, "out"),
    hot: true
  }
})

const isDevServer = process.argv.find(v => v.includes("webpack-dev-server"))

module.exports = isDevServer ? rendererConfig : mainConfig

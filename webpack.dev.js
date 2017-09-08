const fs = require("fs")
const path = require("path")
const webpack = require("webpack")
const merge = require("webpack-merge")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const HtmlWebpackPlugin = require("html-webpack-plugin")
const common = require("./webpack.common")

const devServerHost = "localhost"
const devServerPort = 3000
const devServerUrl = `http://${devServerHost}:${devServerPort}/`

const templateContent = () => {
  const scriptTag = `
    <script
       type="text/javascript"
       src="${devServerUrl}${common.rendererConfig.output.filename}">
    </script>
  `
  const html = fs.readFileSync(path.resolve(process.cwd(), common.htmlTemplatePath)).toString()
  const bodyClosingStart = html.indexOf("</body>")
  return `
    ${html.substring(0, bodyClosingStart)}
    ${scriptTag}
    ${html.substring(bodyClosingStart)}
  `
}

const mainConfig = merge(common.mainConfig, {
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
  entry: [
    "babel-polyfill",
    "react-hot-loader/patch",
    `webpack-dev-server/client?${devServerUrl}`,
    "webpack/hot/only-dev-server",
    common.rendererEntry
  ],
  output: {
    publicPath: common.devServerUrl
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
    //new BundleAnalyzerPlugin()
  ],
  devServer: {
    host: devServerHost,
    port: devServerPort,
    contentBase: common.outDirName,
    hot: true
  }
})

const isDevServer = process.argv.find(v => v.includes("webpack-dev-server"))

module.exports = isDevServer ? rendererConfig : mainConfig

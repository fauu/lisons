const fs = require("fs")
const path = require("path")
const webpack = require("webpack")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const common = require("./webpack.common")

const devServerHost = "localhost"
const devServerPort = 3000
const devServerUrl = `http://${devServerHost}:${devServerPort}/`

const templateContent = () => {
  const scriptTag = `
    <script
       type="text/javascript"
       src="${devServerUrl}${common.rendererConstants.outputFilename}">
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

const mainConfig = {
  target: "electron-main",
  entry: common.mainConstants.entry,
  output: common.mainConstants.output,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["babel-loader", "ts-loader"],
        include: common.srcPath
      }
    ]
  },
  resolve: common.mainConstants.resolve,
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
}

const rendererConfig = {
  target: "electron-renderer",
  entry: [
    "babel-polyfill",
    "react-hot-loader/patch",
    `webpack-dev-server/client?${devServerUrl}`,
    "webpack/hot/only-dev-server",
    common.rendererConstants.entry
  ],
  output: {
    filename: common.rendererConstants.outputFilename,
    path: common.rendererConstants.outputPath,
    publicPath: common.devServerUrl
  },
  module: common.rendererConstants.module,
  resolve: common.rendererConstants.resolve,
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ForkTsCheckerWebpackPlugin()
    //new BundleAnalyzerPlugin()
  ],
  devServer: {
    host: devServerHost,
    port: devServerPort,
    contentBase: common.outDirName,
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
}

const isDevServer = process.argv.find(v => v.includes("webpack-dev-server"))

module.exports = isDevServer ? rendererConfig : mainConfig

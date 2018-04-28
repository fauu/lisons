import * as React from "react"
import * as ReactDOM from "react-dom"

import { App } from "~/app/components"

import { setConfig } from "react-hot-loader"
setConfig({ logLevel: "debug" })

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("app")
)

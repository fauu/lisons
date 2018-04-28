import * as React from "react"
import * as ReactDOM from "react-dom"

import { App } from "~/app/components"

ReactDOM.render(
  // @ts-ignore
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("app")
)

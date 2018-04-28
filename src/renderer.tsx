import * as React from "react"
import * as ReactDOM from "react-dom"
import { AppContainer } from "react-hot-loader"

import { App } from "~/app/components"

const rootEl = document.getElementById("app")
ReactDOM.render(
  // @ts-ignore
  <AppContainer>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AppContainer>,
  rootEl
)

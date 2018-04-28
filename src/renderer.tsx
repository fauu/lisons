import * as React from "react"
import * as ReactDOM from "react-dom"
import { AppContainer } from "react-hot-loader"

import { App } from "~/app/components/App"

const rootEl = document.getElementById("app")
const render = () =>
  ReactDOM.render(
    // @ts-ignore
    <AppContainer>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </AppContainer>,
    rootEl
  )
render()

declare var module: { hot: { accept: (fn: any) => any } }
if (module.hot) {
  module.hot.accept(render)
}

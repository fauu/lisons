import { AppContainer } from "react-hot-loader";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";

const rootEl = document.getElementById("app");
const render = (App: any) =>
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    rootEl
  );

render(App);
const mdl = module as any;
if (mdl.hot) mdl.hot.accept("./App", () => render(require("./App").default));

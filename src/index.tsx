import * as mobx from "mobx";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "~/app/components";
import { AppStore } from "~/app/stores";

mobx.configure({ computedRequiresReaction: true, enforceActions: true });

ReactDOM.render(<App store={new AppStore()} />, document.getElementById("app"));

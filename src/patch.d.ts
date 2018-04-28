import * as React from "react"
declare global {
  declare namespace JSX {
    interface ElementClass {
      render: () => React.ReactNode
    }
  }
}

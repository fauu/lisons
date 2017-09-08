import * as React from "react"
import * as ReactCSSTransitionReplace from "react-css-transition-replace"

// XXX: Upgrading react-css-transition-replace to 3.0.0 causes reader sidebar to
//      not rerender when translations are received
export function FadeTransition({ children }: { children: JSX.Element }): JSX.Element {
  return (
    <ReactCSSTransitionReplace
      transitionName="fade-wait"
      transitionEnterTimeout={1000}
      transitionLeaveTimeout={1000}
    >
      {children}
    </ReactCSSTransitionReplace>
  )
}

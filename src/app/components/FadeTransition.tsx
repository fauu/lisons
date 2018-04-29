import * as React from "react"
import * as ReactCSSTransitionReplace from "react-css-transition-replace"

export interface IFadeTransitionProps {
  readonly children: JSX.Element
}
export function FadeTransition({ children }: IFadeTransitionProps): JSX.Element {
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

import * as React from "react";
import * as ReactCSSTransitionReplace from "react-css-transition-replace";

export interface FadeTransitionProps {
  children: JSX.Element;
}
export function FadeTransition({ children }: FadeTransitionProps): JSX.Element {
  return (
    <ReactCSSTransitionReplace
      transitionName="fade-wait"
      transitionEnterTimeout={1000}
      transitionLeaveTimeout={1000}
    >
      {children}
    </ReactCSSTransitionReplace>
  );
}

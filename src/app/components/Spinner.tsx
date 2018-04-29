import * as React from "react"
import styled, { keyframes } from "styled-components"

import { withProps } from "~/util/StyleUtils"

// http://tobiasahlin.com/spinkit/
export interface ISpinnerProps {
  readonly color: string | "Light" | "Dark"
}
export function Spinner({ color }: ISpinnerProps): JSX.Element {
  return (
    <SkCubeGrid color={color} className="spinner">
      <div className="sk-cube sk-cube1" />
      <div className="sk-cube sk-cube2" />
      <div className="sk-cube sk-cube3" />
      <div className="sk-cube sk-cube4" />
      <div className="sk-cube sk-cube5" />
      <div className="sk-cube sk-cube6" />
      <div className="sk-cube sk-cube7" />
      <div className="sk-cube sk-cube8" />
      <div className="sk-cube sk-cube9" />
    </SkCubeGrid>
  )
}

const skCubeGridDelay = keyframes`
  0%,
  70%,
  100% {
    transform: scale3D(1, 1, 1);
  }
  35% {
    transform: scale3D(0, 0, 1);
  }
`

const SkCubeGrid = withProps<{ color: string }>()(styled.div)`
  width: 40px;
  height: 40px;
  margin: auto;
  .sk-cube {
    width: 33%;
    height: 33%;
    background-color: ${p =>
      p.color === "Light"
        ? "rgba(255, 255, 255, 0.5)"
        : p.color === "Dark"
          ? "rgba(0, 0, 0, 0.2)"
          : p.color};
    float: left;
    animation: ${skCubeGridDelay} 1.3s infinite ease-in-out;
  }
  .sk-cube1 {
    animation-delay: 0.2s;
  }
  .sk-cube2 {
    animation-delay: 0.3s;
  }
  .sk-cube3 {
    animation-delay: 0.4s;
  }
  .sk-cube4 {
    animation-delay: 0.1s;
  }
  .sk-cube5 {
    animation-delay: 0.2s;
  }
  .sk-cube6 {
    animation-delay: 0.3s;
  }
  .sk-cube7 {
    animation-delay: 0s;
  }
  .sk-cube8 {
    animation-delay: 0.1s;
  }
  .sk-cube9 {
    animation-delay: 0.2s;
  }
`

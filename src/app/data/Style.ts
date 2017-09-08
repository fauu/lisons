import { keyframes } from "styled-components"

export const colors = {
  primary: "#222",
  primaryFade: "#777",
  secondary: "#f9f9f9",
  secondaryFade: "#aaa",
  accent: "#ff9a8b",
  accent2: "#ff99ac",
  danger: "#ff5a4b",
  inputBg: "#ffffff"
}

export const fonts = {
  ui: "Lato",
  serif: "PT Serif"
}

const time = "0.2s"
const doubleTime = "0.4s"
const timingFunction = "ease-out"

export const animations = {
  stdTime: time,
  stdFunction: timingFunction,
  std: `${time} ${timingFunction}`,
  doubleTime: `${doubleTime} ${timingFunction}`,
  halfFade: keyframes`
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  `,
  fadeIn: keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `,
  fadeInTop: keyframes`
    from {
      opacity: 0;
      transform: translateY(-3rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  fadeInBottom: keyframes`
    from {
      opacity: 0;
      transform: translateY(3rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  fadeInLeft: keyframes`
    from {
      opacity: 0;
      transform: translateX(-3rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,
  fadeOut: keyframes`
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  `,
  gradientRotate: keyframes`
    0% {
      background-position: 0% 51%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 51%
    }
  `
}

import { ThemedStyledFunction } from "styled-components"

// https://github.com/styled-components/styled-components/issues/630#issuecomment-317277803
export const withProps = <U>() => <P, T, O>(
  fn: ThemedStyledFunction<P, T, O>
): ThemedStyledFunction<P & U, T, O & U> => fn

export const hexToRgb = (hexColor: string = "FF00FF"): [number, number, number] => {
  if (hexColor[0] === "#") {
    hexColor = hexColor.substr(1)
  }
  if (hexColor.length !== 6) {
    return [255, 0, 255]
  }
  return [hexColor.substr(0, 2), hexColor.substr(2, 2), hexColor.substr(4, 2)].map(c =>
    parseInt(c, 16)
  ) as [number, number, number]
}

const getLuma = (color: [number, number, number]) =>
  (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255

export const isColorDark = (color: [number, number, number]) => getLuma(color) < 0.5

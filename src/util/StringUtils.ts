export const firstNWords = (
  s: string,
  n: number,
  maxLength?: number,
  appendEllipsis: boolean = false
): string => {
  s = s.trim()
  let spaceCount = 0
  let i = 0
  if (!maxLength) {
    maxLength = s.length
  }
  for (; i < maxLength && spaceCount < n; i++) {
    if (s[i] === " ") {
      spaceCount++
    }
  }
  s = s.substr(0, i - 1).trim()
  return appendEllipsis ? `${s}…` : s
}

export const hasSpace = (s: string) => s.indexOf(" ") !== -1

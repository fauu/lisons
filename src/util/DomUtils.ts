export const getElementNo = (el?: Element): number | undefined => {
  if (!el) {
    return undefined
  }
  const noStr = el.getAttribute("data-no")
  return noStr ? parseInt(noStr, 10) : undefined
}

export const appendElement = (parent: Element, child: Element): Element => parent.appendChild(child)

export const prependElement = (parent: Element, child: Element): Element =>
  parent.insertBefore(child, parent.firstChild)

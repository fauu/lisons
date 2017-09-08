import { getElementNo } from "~/util/DomUtils"

type SelectionEnd = "Start" | "End"

interface ISelectionElement {
  no: number
  el: Element
}

// TODO: Cleanup, limit '!' operator abuse
export class TextSelection {
  private static readonly selectedClassName = "selected"
  private static readonly multiParagraph = false

  private _initialElement: ISelectionElement | undefined
  private _firstElement: ISelectionElement | undefined
  private _lastElement: ISelectionElement | undefined

  public get text(): string {
    let text = ""
    this.forEachElement(el => (text += el.textContent))
    return text
  }

  public get firstElement(): Element {
    return this._firstElement!.el
  }

  public clear(): void {
    this.forEachElement(el => this.setSelectedClass(el, false))
  }

  public update(el: Element): void {
    if (!this._firstElement || !this._lastElement || !this._initialElement) {
      const no = getElementNo(el)
      this._initialElement = { no: no!, el }
      this._firstElement = this._initialElement
      this._lastElement = this._initialElement
      this.setSelectedClass(this._initialElement.el, true)
      return
    }

    if (!TextSelection.multiParagraph && el.parentNode !== this._initialElement.el.parentNode) {
      return
    }

    const sel = { no: getElementNo(el), el }
    if (sel.no! < this._firstElement.no) {
      this.trim("End", this._initialElement)
      let currentElement = sel.el
      while (currentElement !== this._firstElement.el) {
        this.setSelectedClass(currentElement, true)
        currentElement = currentElement.nextElementSibling!
      }
      this._firstElement = { no: sel.no!, el: sel.el }
    } else if (sel.no! > this._lastElement.no) {
      this.trim("Start", this._initialElement)
      let currentElement = sel.el
      while (currentElement !== this._lastElement.el) {
        this.setSelectedClass(currentElement, true)
        currentElement = currentElement.previousElementSibling!
      }
      this._lastElement = { no: sel.no!, el: sel.el }
    } else {
      this.trim(sel.no! < this._initialElement.no ? "Start" : "End", {
        no: sel.no!,
        el: sel.el
      })
    }

    return
  }

  private trim(from: SelectionEnd, to: ISelectionElement): void {
    let currentElement = from === "Start" ? this._firstElement!.el : this._lastElement!.el
    while (getElementNo(currentElement) !== to.no) {
      this.setSelectedClass(currentElement, false)
      currentElement =
        from === "Start"
          ? currentElement.nextElementSibling!
          : currentElement.previousElementSibling!
    }
    this[from === "Start" ? "_firstElement" : "_lastElement"] = to
  }

  private setSelectedClass(el: Element, set: boolean): void {
    if (set) {
      el.classList.add(TextSelection.selectedClassName)
    } else {
      el.classList.remove(TextSelection.selectedClassName)
    }
  }

  private forEachElement(f: (el: Element) => void): void {
    let currentElement: Element = this._firstElement!.el
    do {
      f(currentElement)
      currentElement = currentElement.nextElementSibling!
    } while (getElementNo(currentElement!)! <= this._lastElement!.no)
  }
}

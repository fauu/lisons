import { action, observable, reaction } from "mobx"

import { ITokenizedTextContent, TextTokenType } from "~/app/model"
import { appendElement, getElementNo, prependElement } from "~/util/DomUtils"

import { TextSelection } from "~/reader/TextSelection"

// TODO: Make this code less crap
export class TextView {
  private static readonly debug = true
  private static readonly translationAttributeName = "data-translation"
  private static readonly textTransitionTimeMs = 200

  @observable public firstPageElementNo: number
  @observable public lastPageElementNo: number
  @observable private _range?: [number, number]
  private selection?: TextSelection
  private mouse1Down: boolean
  private rootElementId: string
  private root: HTMLElement

  public constructor(
    private onSelect: (t: string) => void,
    private onRangeChange: (range: [number, number]) => void
  ) {
    reaction(() => this._range, range => range && this.onRangeChange(range))
  }

  public attach(rootElementId: string): void {
    this.rootElementId = rootElementId
    const root = document.getElementById(rootElementId)
    if (!root) {
      return
    }
    this.root = root

    this.root.parentElement!.addEventListener("mousedown", this.handleBodyMouseDown)
    this.root.parentElement!.addEventListener("mouseup", this.handleBodyMouseUp)

    this.handleWindowResize()
    window.addEventListener("resize", () => {
      this.handleWindowResize()
    })
  }

  public showTranslation(translation: string): void {
    this.selection!.firstElement.setAttribute(TextView.translationAttributeName, translation)
  }

  public get firstVisibleElement(): Element | undefined {
    if (!this.root) {
      return undefined
    }
    const firstParagraph = this.root.firstElementChild
    return (firstParagraph && firstParagraph.firstElementChild) || undefined
  }

  public get lastVisibleElement(): Element | undefined {
    if (!this.root) {
      return undefined
    }
    const rootBoundaryRight = this.root.offsetLeft + this.root.offsetWidth
    let previousElement
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.root.children.length; i++) {
      const paragraph = this.root.children[i]
      // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < paragraph.children.length; j++) {
        const currentElement = paragraph.children[j] as HTMLElement
        if (currentElement.offsetLeft > rootBoundaryRight) {
          return previousElement
        }
        previousElement = currentElement
      }
    }

    return previousElement
  }

  private get liveFirstVisibleElementNo(): number | undefined {
    return getElementNo(this.firstVisibleElement)
  }

  private get liveLastVisibleElementNo(): number | undefined {
    return getElementNo(this.lastVisibleElement)
  }

  public renderPage(content: ITokenizedTextContent): Promise<void> {
    this.fadeOutRoot()
    const startTime = window.performance.now()
    const newRoot = this.createNewRoot()

    const { types, values, startNo } = content
    let paragraph
    for (let i = 0; i < types.length; i++) {
      if (!paragraph) {
        paragraph = document.createElement("p")
        appendElement(newRoot, paragraph)
      }
      if (types[i] === TextTokenType.ParagraphBreak && paragraph.children.length > 0) {
        paragraph = undefined
        continue
      }

      const el = this.createTextElement(types[i], values[i], i + startNo, TextView.debug)
      appendElement(paragraph, el)
    }

    if (paragraph) {
      appendElement(newRoot, paragraph)
    }

    return new Promise((resolve, _) => {
      setTimeout(() => {
        this.replaceRoot(newRoot)
        this.fitText()
        this.fadeInRoot()
        resolve()
      }, TextView.textTransitionTimeMs + window.performance.now() - startTime)
    })
  }

  public renderPrevPage(content: ITokenizedTextContent): Promise<void> {
    this.fadeOutRoot()

    // TODO: Don't wait, do the work while fading out previous root if possible
    return new Promise((resolve, _) => {
      setTimeout(() => {
        this.doRenderPrevPage(content)
        this.fitText()
        this.fadeInRoot()
        resolve()
      }, TextView.textTransitionTimeMs)
    })
  }

  private doRenderPrevPage(content: ITokenizedTextContent): void {
    this.replaceRoot(this.root.cloneNode(false))

    const { types, values, startNo } = content
    const rootBoundaryRight = this.root.offsetLeft + this.root.offsetWidth
    this.root.innerHTML = ""
    let paragraph
    let targetLastElement
    for (let i = types.length - 1; i >= 0; i--) {
      if (types[i] === TextTokenType.ParagraphBreak) {
        paragraph = undefined
        continue
      }
      if (!paragraph) {
        paragraph = document.createElement("p")
        prependElement(this.root, paragraph)
      }

      const elNo = i + startNo
      const el = this.createTextElement(types[i], values[i], elNo, TextView.debug)
      if (!targetLastElement) {
        targetLastElement = el as HTMLElement
      }
      prependElement(paragraph, el)

      if (targetLastElement.offsetLeft > rootBoundaryRight) {
        this.removeFirstTextElement()
        break
      }
    }

    if (paragraph && paragraph.children.length === 0) {
      this.root.removeChild(paragraph)
    }
  }

  private replaceRoot(newRoot: Node): void {
    this.root!.parentNode!.replaceChild(newRoot, this.root)
    this.root = newRoot as HTMLElement
  }

  private fadeOutRoot(): void {
    this.root.style.opacity = "0"
  }

  private fadeInRoot(): void {
    this.root.style.opacity = "1"
  }

  private createNewRoot(): HTMLElement {
    const newRoot = document.createElement("div")
    newRoot.id = this.rootElementId
    newRoot.style.opacity = "0"
    newRoot.style.transitionProperty = "opacity"
    newRoot.style.transitionTimingFunction = "ease-in"
    return newRoot
  }

  private removeFirstTextElement(): void {
    const firstParagraph = this.root.firstChild as HTMLElement
    const numFirstParagraphChildren = firstParagraph.children.length
    if (numFirstParagraphChildren === 0) {
      this.root.removeChild(firstParagraph)
    } else {
      firstParagraph.removeChild(firstParagraph.firstChild!)
    }
  }

  private createTextElement(
    type: TextTokenType,
    value: string,
    no: number,
    debug: boolean = false
  ): Element {
    const el = document.createElement("span")
    if (type === TextTokenType.Word) {
      el.addEventListener("mouseenter", this.handleWordMouseEnter)
      el.addEventListener("mousedown", this.handleWordMouseDown)
    }
    el.dataset.no = String(no)
    el.textContent = debug ? `${el.dataset.no} ` : value

    return el
  }

  private handleWindowResize(): void {
    this.fitText()
  }

  private fitText(): void {
    const rootStyle = window.getComputedStyle(this.root)
    const rootParent = this.root.parentElement!
    const textProgress = rootParent.previousElementSibling!
    const textProgressStyle = window.getComputedStyle(textProgress)
    const margin = this.root.offsetTop + parseInt(textProgressStyle.height!, 10)
    const lineHeight = parseFloat(rootStyle.lineHeight!)
    const windowHeight = window.innerHeight
    const noLines = Math.floor((windowHeight - margin) / lineHeight) - 1
    this.root.style.height = `${String(lineHeight * noLines)}px`
    this.updateRange()
  }

  @action
  private updateRange(): void {
    if (!this.firstVisibleElement || !this.lastVisibleElement) {
      this._range = undefined
      return
    }

    this.firstPageElementNo = this.liveFirstVisibleElementNo!
    this.lastPageElementNo = this.liveLastVisibleElementNo!

    const maybeNewRange: [number, number] = [this.firstPageElementNo!, this.lastPageElementNo!]
    if (
      !this._range ||
      maybeNewRange[0] !== this._range[0] ||
      maybeNewRange[1] !== this._range[1]
    ) {
      this._range = maybeNewRange
    }
  }

  private clearSelection(): void {
    if (!this.selection) {
      return
    }
    this.selection.firstElement.removeAttribute(TextView.translationAttributeName)
    this.selection.clear()
    this.selection = undefined
    this.onSelect("")
  }

  private beginSelection(el: Element): void {
    if (this.selection) {
      this.clearSelection()
    }
    this.selection = new TextSelection()
    this.selection.update(el)
  }

  private get range(): [number, number] | undefined {
    return this._range
  }

  private handleBodyMouseDown = (e: MouseEvent) => {
    if (this.selection) {
      this.clearSelection()
    }
    if (e.button === 0) {
      this.mouse1Down = true
    }
  }

  private handleBodyMouseUp = (e: MouseEvent) => {
    if (e.button !== 0) {
      return
    }
    if (this.selection) {
      this.onSelect(this.selection.text)
    }
    this.mouse1Down = false
  }

  private handleWordMouseEnter = (e: MouseEvent) => {
    if (this.mouse1Down && this.selection) {
      this.selection.update(e.toElement)
    }
  }

  private handleWordMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) {
      return
    }
    if (this.selection) {
      this.clearSelection()
    }
    this.beginSelection(e.toElement)
    this.mouse1Down = true
    e.stopPropagation()
  }
}

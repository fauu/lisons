import { action, computed, observable, reaction } from "mobx"

import { ITextSectionInfo, Text } from "~/app/model"
import { TextStore } from "~/app/stores"

import { SidebarStore } from "~/reader/stores"
import { TextView } from "~/reader/TextView"

export class ReaderStore {
  private static readonly numPreloadedTextElementsPerPage = 1000
  private static readonly skipLengthElements = 10000
  private static readonly readingProgressFoldThresholdPp = 1.5

  @observable public isTocOpen: boolean
  @observable.ref public text?: Text
  @observable public readingProgress?: [number, number] | number
  @observable.ref public currentSection?: ITextSectionInfo
  @observable private _selectedText: string
  @observable.ref private _textView?: TextView
  private _sidebarStore: SidebarStore

  public constructor(private _textStore: TextStore) {
    this._sidebarStore = new SidebarStore()
    reaction(
      () => this._selectedText,
      _selectedText => this.handleSelectedTextChange(_selectedText)
    )
  }

  public initTextView(): TextView {
    this.setTextView(new TextView(text => this.setSelectedText(text), this.handleTextRangeChange))
    this._sidebarStore.setResourcesNotLoading()
    this._sidebarStore.updateSources(this.text!.contentLanguage, this.text!.translationLanguage)
    return this._textView!
  }

  @action
  public clear(): void {
    this._selectedText = ""
    this.text = undefined
    this.currentSection = undefined
    this.isTocOpen = false
    this.readingProgress = undefined
    this._textView = undefined
  }

  public showPrevPage = async (): Promise<void> => {
    const targetElementNo = this._textView!.firstPageElementNo - 1
    let count = ReaderStore.numPreloadedTextElementsPerPage
    let from = targetElementNo - ReaderStore.numPreloadedTextElementsPerPage + 1
    if (from < 0) {
      from = 0
      count = targetElementNo + 1
    }
    await this._textView!.renderPrevPage(this.text!.getTokenizedContentSlice(from, count))
    this.setSelectedText("")
    this.updateCurrentSection()
  }

  public showNextPage = async (): Promise<void> => {
    const lastNo = this._textView!.lastPageElementNo
    await this.scrollText(lastNo! + 1)
  }

  public skipForward = async (): Promise<void> => {
    const lastNo = this._textView!.lastPageElementNo
    await this.scrollText(lastNo! + ReaderStore.skipLengthElements)
  }

  public skipBackward = async (): Promise<void> => {
    const firstNo = this._textView!.firstPageElementNo
    await this.scrollText(firstNo! - ReaderStore.skipLengthElements)
  }

  public async scrollText(to: number | "LastKnownPosition"): Promise<void> {
    const text = this.text!
    if (to === "LastKnownPosition") {
      to = text.progress ? text.progress.elementNo : 0
    } else if (to < 0) {
      to = 0
    } else if (to >= text.elementCount) {
      to = text.elementCount - 1
    }
    await this._textView!.renderPage(
      this.text!.getTokenizedContentSlice(to, ReaderStore.numPreloadedTextElementsPerPage)
    )
    this.updateCurrentSection()
    this.setSelectedText("")
  }

  // XXX: (Probably) fails when the first element is a paragraph break
  //      (which isn't rendered as an element).
  @computed
  public get isFirstPage(): boolean {
    if (!this._textView) {
      return false
    }
    const firstElementNo = this._textView.firstPageElementNo
    return firstElementNo !== undefined && firstElementNo === 0
  }

  @computed
  public get isLastPage(): boolean {
    if (!this._textView) {
      return false
    }
    const lastElementNo = this._textView.lastPageElementNo
    return lastElementNo !== undefined && lastElementNo === this.text!.elementCount - 1
  }

  @action
  public setText(value?: Text): void {
    this.text = value
  }

  public toggleTocVisible = (): void => {
    this.setTocVisible(!this.isTocOpen)
  }

  @action
  public setTocVisible(value: boolean = true): void {
    this.isTocOpen = value
  }

  private updateCurrentSection(): void {
    if (!this.text) {
      return
    }
    const sections = this.text.structure
    if (!sections || sections.length < 2) {
      return
    }
    const lastElNo = this._textView!.lastPageElementNo!
    if (!lastElNo) {
      this.setCurrentSection(sections[0])
      return
    }
    let i = 0
    for (; i < sections.length; i++) {
      if (sections[i].startElementNo > lastElNo) {
        break
      }
    }
    this.setCurrentSection(sections[i - 1])
  }

  private async saveTextProgress(startElementNo: number): Promise<void> {
    if (!this._textView) {
      return
    }
    await this._textStore.setTextProgress(this.text!.id, {
      elementNo: startElementNo,
      percentage: startElementNo / this.text!.elementCount * 100
    })
  }

  private handleSelectedTextChange = async (_selectedText: string): Promise<void> => {
    this._sidebarStore.update(
      _selectedText,
      this.text!.contentLanguage,
      this.text!.translationLanguage,
      this._textView!.showTranslation.bind(this._textView)
    )
  }

  private handleTextRangeChange = (elementRange: [number, number]): void => {
    this.updateReadingProgress(elementRange)
    this.saveTextProgress(elementRange[0])
  }

  @action
  private updateReadingProgress(elementRange: [number, number]): void {
    const [percentageStart, percentageEnd] = elementRange.map(
      elementNo => elementNo / this.text!.elementCount * 100
    )
    const diff = percentageEnd - percentageStart
    this.readingProgress =
      diff > ReaderStore.readingProgressFoldThresholdPp
        ? [percentageStart, percentageEnd]
        : percentageEnd
  }

  @action
  private setSelectedText(text: string): void {
    this._selectedText = text
  }

  @action
  private setCurrentSection(value?: ITextSectionInfo): void {
    this.currentSection = value
  }

  @action
  private setTextView(value?: TextView): void {
    this._textView = value
  }

  public get sidebarStore(): SidebarStore {
    return this._sidebarStore
  }
}

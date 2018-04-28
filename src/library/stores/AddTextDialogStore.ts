import { Epub } from "@gxl/epub-parser/build/types/epubParser"
import { action, computed, observable, reaction, runInAction } from "mobx"
import { IPromiseBasedObservable } from "mobx-utils"

import { IParsedText } from "~/app/model"
import { TextStore } from "~/app/stores"
import { detectLanguage, getEpubOrPlainContent, isEpub, parseText } from "~/util/TextUtils"

import { FileStatus, IAddTextFormData, IEpubInfo } from "~/library/model"

export class AddTextDialogStore {
  private static readonly languageDetectionSampleLength = 5000

  @observable.ref public fileContent?: Epub | string
  @observable public pastedContent?: string
  @observable public detectedLanguage?: string | undefined
  @observable public isProcessingFile: boolean = false
  @observable public isLanguageConfigurationInvalid: boolean = false
  @observable public isSavingText: boolean = false
  public tatoebaTranslationCount?: IPromiseBasedObservable<number>
  @observable private parsedText?: IParsedText

  public constructor(private textStore: TextStore) {
    reaction(() => this.pastedContent, content => this.handlePastedContentChange(content), {
      delay: 1000
    })
    reaction(() => this.parsedText, text => this.handleParsedTextChange(text))
  }

  public async saveText(formData: IAddTextFormData): Promise<void> {
    if (!this.fileContent && !this.pastedContent) {
      return
    }
    this.setSavingText(true)
    const parsedText =
      this.parsedText ||
      parseText(this.pastedContent!, AddTextDialogStore.languageDetectionSampleLength)
    await this.textStore.add(
      {
        title: formData.title,
        author: formData.author,
        progressElementNo: 0,
        progressPercentage: 0,
        contentLanguage: formData.contentLanguage,
        translationLanguage: formData.translationLanguage
      },
      parsedText
    )
    runInAction(() => {
      this.pastedContent = undefined
      this.fileContent = undefined
      this.parsedText = undefined
      this.isSavingText = false
    })
  }

  public async processFile(path: string): Promise<void> {
    this.setProcessingFile(true)
    const epubOrPlainContent = await getEpubOrPlainContent(path)
    runInAction(() => {
      this.fileContent = epubOrPlainContent
      this.parsedText = parseText(
        epubOrPlainContent,
        AddTextDialogStore.languageDetectionSampleLength
      )
      this.detectedLanguage = detectLanguage(this.parsedText!.sample)
      this.isProcessingFile = false
    })
  }

  public handleSelectedFilePathChange(filePath: string): void {
    if (filePath) {
      this.processFile(filePath)
    } else {
      this.discardLoadedFile()
    }
  }

  @action
  public handleSelectedLanguagesChange([contentLanguage, translationLanguage]: [
    string,
    string
  ]): void {
    this.isLanguageConfigurationInvalid = contentLanguage === translationLanguage
    // this.tatoebaTranslationCount = this.isLanguageConfigurationInvalid
    //   ? undefined
    //   : fromPromise(getSentenceCount(contentLanguage, translationLanguage))
  }

  @computed
  public get textFileStatus(): FileStatus {
    if (this.isProcessingFile) {
      return "Processing"
    }
    if (this.fileContent !== undefined) {
      return this.fileContent === "" ? "Invalid" : "Valid"
    }
    return "NotAdded"
  }

  @computed
  public get loadedEpubInfo(): IEpubInfo | undefined {
    const maybeEpub = this.fileContent
    if (maybeEpub && isEpub(maybeEpub)) {
      const epub = maybeEpub as Epub
      return { author: epub.info.author, title: epub.info.title }
    }
    return undefined
  }

  @action
  public discardLoadedFile(): void {
    this.fileContent = undefined
    this.parsedText = undefined
  }

  @action
  public setPastedContent(value?: string): void {
    this.pastedContent = value
  }

  @action
  private setDetectedLanguage(value?: string): void {
    this.detectedLanguage = value
  }

  @action
  private setProcessingFile(value: boolean): void {
    this.isProcessingFile = value
  }

  @action
  private setSavingText(value: boolean): void {
    this.isSavingText = value
  }

  @action
  private setParsedText(value?: IParsedText): void {
    this.parsedText = value
  }

  private handlePastedContentChange = (content?: string): void => {
    this.setParsedText(
      content ? parseText(content, AddTextDialogStore.languageDetectionSampleLength) : undefined
    )
  }

  private handleParsedTextChange = (text?: IParsedText): void => {
    this.setDetectedLanguage(text ? detectLanguage(text.sample) : undefined)
  }
}

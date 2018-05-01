import { action, computed, observable, reaction } from "mobx"
import { IPromiseBasedObservable } from "mobx-utils"

import { IEpub } from "~/vendor/epub-parser"

import { IParsedText } from "~/app/model"
import { TextStore } from "~/app/stores"
import { flowed } from "~/util/MobxUtils"
import { detectLanguage, getEpubOrPlainContent, isEpub, takeSample } from "~/util/TextUtils"

import { FileStatus, IAddTextFormData, IEpubInfo } from "~/library/model"

export class AddTextDialogStore {
  private static readonly languageDetectionSampleLength = 5000

  @observable.ref public fileContent?: IEpub | string
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

  @flowed
  public *saveText(formData: IAddTextFormData): IterableIterator<Promise<void>> {
    if (!this.fileContent && !this.pastedContent) {
      return
    }
    this.setSavingText(true)
    const parsedText = this.parsedText || {
      content: this.pastedContent!,
      sample: takeSample(this.pastedContent!, AddTextDialogStore.languageDetectionSampleLength)
    }
    yield this.textStore.add(
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
    this.pastedContent = undefined
    this.fileContent = undefined
    this.parsedText = undefined
    this.isSavingText = false
  }

  @flowed
  public *processFile(path: string): IterableIterator<Promise<string | IEpub>> {
    this.setProcessingFile(true)
    const epubOrPlainContent: string | IEpub = yield getEpubOrPlainContent(path)
    this.fileContent = epubOrPlainContent
    const isEpubResult = isEpub(epubOrPlainContent)
    const content = isEpubResult
      ? (epubOrPlainContent as IEpub).markedContent
      : (epubOrPlainContent as string)
    this.parsedText = {
      content,
      sectionNames: isEpubResult ? (epubOrPlainContent as IEpub).sectionNames : undefined,
      sample: takeSample(content, AddTextDialogStore.languageDetectionSampleLength)
    }
    this.detectedLanguage = detectLanguage(this.parsedText!.sample)
    this.isProcessingFile = false
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
      const epub = maybeEpub as IEpub
      return {
        author: epub.author ? epub.author : "",
        title: epub.title ? epub.title : ""
      }
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
      content
        ? { content, sample: takeSample(content, AddTextDialogStore.languageDetectionSampleLength) }
        : undefined
    )
  }

  private handleParsedTextChange = (text?: IParsedText): void => {
    this.setDetectedLanguage(text ? detectLanguage(text.sample) : undefined)
  }
}

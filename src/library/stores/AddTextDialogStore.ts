import * as iconv from "iconv-lite"
import jschardet = require("jschardet")
import { action, computed, observable, reaction } from "mobx"
import { IPromiseBasedObservable } from "mobx-utils"

import SaveFileWorker = require("worker-loader?name=dist/[name].js!../../app/SaveFileWorker")
import { ILanguage } from "~/app/model"
import { fileSize, isBufferText, readFile } from "~/util/FileUtils"
import { languageFromCodeGt } from "~/util/LanguageUtils"
import { flowed } from "~/util/MobxUtils"
import { detectLanguage } from "~/util/TextUtils"

import { loadMetadata } from "~/vendor/epub-parser/EpubParser"
import { isUtf8 } from "~/vendor/is-utf8"

import { IAddTextFormData, ITextFileMetadata, TextFileStatus } from "~/library/model"

export class AddTextDialogStore {
  private static readonly languageDetectionSampleLength = 5000

  @observable public detectedTextLanguage?: ILanguage
  @observable public isLanguageConfigurationValid: boolean = true
  @observable public isSavingText: boolean = false
  @observable public textFileMetadata?: ITextFileMetadata

  public tatoebaTranslationCount?: IPromiseBasedObservable<number>

  @observable private isProcessingTextFile: boolean = false
  @observable private pastedText?: string
  @observable private textFileBuffer?: Buffer

  private textFilePlaintext?: string

  public constructor() {
    reaction(() => this.pastedText, text => this.handlePastedTextChange(text), { delay: 1000 })
    reaction(() => this.textFileMetadata, metadata => this.handleTextFileMetadataChange(metadata))
  }

  @computed
  public get textFileStatus(): TextFileStatus {
    if (this.isProcessingTextFile) {
      return "Processing"
    } else if (!this.textFileBuffer) {
      return "NotSelected"
    } else if (!this.textFileMetadata) {
      return "Invalid"
    } else {
      return "Valid"
    }
  }

  @flowed
  public *saveText(formData: IAddTextFormData): IterableIterator<Promise<void>> {
    this.isSavingText = true

    const worker = new SaveFileWorker()
    worker.onmessage = (ev: MessageEvent) => {
      console.log(ev.data)
      worker.terminate()

      this.discardText()
      this.isSavingText = false
    }
    worker.postMessage({
      formData,
      pastedText: this.pastedText,
      textFileBuffer: this.textFileBuffer,
      textFilePlaintext: this.textFilePlaintext
    })
  }

  // TODO: Cleanup
  @flowed
  public *processFile(filePath: string): IterableIterator<Promise<any>> {
    this.isProcessingTextFile = true
    try {
      this.textFileBuffer = yield readFile(filePath)
      if (this.textFileBuffer) {
        this.textFileMetadata = yield loadMetadata(this.textFileBuffer)
      }
      this.isProcessingTextFile = false
      return
    } catch (_) {
      // skip
    }
    const isFilePlaintext = this.textFileBuffer
      ? yield isBufferText(this.textFileBuffer, yield fileSize(filePath))
      : false
    if (this.textFileBuffer && isFilePlaintext) {
      this.textFilePlaintext = isUtf8(this.textFileBuffer)
        ? this.textFileBuffer.toString()
        : iconv
            .decode(this.textFileBuffer, jschardet.detect(this.textFileBuffer).encoding)
            .toString()
      this.textFileMetadata = {}
    }
    this.isProcessingTextFile = false
    return
  }

  @action
  public handleSelectedLanguagesChange([contentLanguage, translationLanguage]: [
    ILanguage,
    ILanguage
  ]): void {
    this.isLanguageConfigurationValid = contentLanguage.code6393 !== translationLanguage.code6393
    // this.tatoebaTranslationCount = this.isLanguageConfigurationValid
    //   ? fromPromise(getSentenceCount(contentLanguage, translationLanguage))
    //   : undefined
  }

  @action
  public discardText(): void {
    this.detectedTextLanguage = undefined
    this.isProcessingTextFile = false
    this.pastedText = undefined
    this.textFileBuffer = undefined
    this.textFileMetadata = undefined
  }

  @action
  public setPastedText(value?: string): void {
    this.pastedText = value
  }

  public handleSelectedFilePathChange(filePath: string): void {
    if (filePath) {
      this.processFile(filePath)
    } else {
      this.discardText()
    }
  }

  private handlePastedTextChange = (content?: string): void => {
    this.detectedTextLanguage =
      content && content !== ""
        ? detectLanguage(content.substr(0, AddTextDialogStore.languageDetectionSampleLength))
        : undefined
  }

  private handleTextFileMetadataChange(metadata: ITextFileMetadata | undefined): void {
    if (metadata && metadata.language) {
      this.detectedTextLanguage = languageFromCodeGt(metadata.language.substr(0, 2))
    } else if (this.textFilePlaintext) {
      this.detectedTextLanguage = detectLanguage(
        this.textFilePlaintext.substr(0, AddTextDialogStore.languageDetectionSampleLength)
      )
    }
  }
}

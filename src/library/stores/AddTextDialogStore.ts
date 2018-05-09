import * as iconv from "iconv-lite"
import jschardet = require("jschardet")
import { action, observable, reaction } from "mobx"
import { IPromiseBasedObservable } from "mobx-utils"

import { ILanguage } from "~/app/model"
import { fileSize, isBufferText, readFile } from "~/util/FileUtils"
import { flowed } from "~/util/MobxUtils"
import { detectLanguage } from "~/util/TextUtils"

import { FileStatus, IAddTextFormData, IBookFileMetadata } from "~/library/model"
import { languageFromCodeGt } from "~/util/LanguageUtils"
import { loadMetadata } from "~/vendor/epub-parser/EpubParser"
import { isUtf8 } from "~/vendor/is-utf8"

export class AddTextDialogStore {
  private static readonly languageDetectionSampleLength = 5000

  @observable public plainContent?: string
  @observable public detectedLanguage?: ILanguage
  @observable public bookFileMetadata?: IBookFileMetadata
  @observable public isLanguageConfigurationInvalid: boolean = false
  @observable public isSavingText: boolean = false
  @observable public fileStatus: FileStatus = "NotSelected"
  public tatoebaTranslationCount?: IPromiseBasedObservable<number>

  public constructor() {
    reaction(() => this.plainContent, content => this.handlePlainContentChange(content), {
      delay: 1000
    })
    reaction(() => this.bookFileMetadata, metadata => this.handleBookFileMetadataChange(metadata))
  }

  @flowed
  // @ts-ignore
  public *saveText(formData: IAddTextFormData): IterableIterator<Promise<void>> {
    this.setSavingText(true)
    console.log("saveText()", {
      title: formData.title,
      author: formData.author,
      contentLanguage: formData.contentLanguage,
      translationLanguage: formData.translationLanguage,
      plainContent: this.plainContent
    })
    // yield this.textStore.add(
    //   {
    //     title: formData.title,
    //     author: formData.author,
    //     progressElementNo: 0,
    //     progressPercentage: 0,
    //     contentLanguage: formData.contentLanguage,
    //     translationLanguage: formData.translationLanguage
    //   },
    //   this.parsedText
    // )
    this.discardTextToAdd()
    this.isSavingText = false
  }

  @flowed
  public *processFile(path: string): IterableIterator<Promise<any>> {
    this.setFileStatus("Processing")

    let data: Buffer | undefined
    try {
      data = yield readFile(path)
      if (data) {
        this.bookFileMetadata = yield loadMetadata(data)
        this.setFileStatus("Valid")
      } else {
        this.setFileStatus("Invalid")
      }
      return
    } catch (_) {
      // skip
    }
    const isDataText = data ? yield isBufferText(data, yield fileSize(path)) : false
    if (data && isDataText) {
      this.plainContent = isUtf8(data)
        ? data.toString()
        : iconv.decode(data, jschardet.detect(data).encoding).toString()
      this.setFileStatus("Valid")
    } else {
      this.setFileStatus("Invalid")
    }
    return
  }

  public handleSelectedFilePathChange(filePath: string): void {
    if (filePath) {
      this.processFile(filePath)
    } else {
      this.discardTextToAdd()
    }
  }

  @action
  public handleSelectedLanguagesChange([contentLanguage, translationLanguage]: [
    ILanguage,
    ILanguage
  ]): void {
    this.isLanguageConfigurationInvalid = contentLanguage === translationLanguage
    // this.tatoebaTranslationCount = this.isLanguageConfigurationInvalid
    //   ? undefined
    //   : fromPromise(getSentenceCount(contentLanguage, translationLanguage))
  }

  @action
  public discardTextToAdd(): void {
    this.plainContent = undefined
    this.detectedLanguage = undefined
    this.bookFileMetadata = undefined
    this.fileStatus = "NotSelected"
  }

  @action
  public setPlainContent(value?: string): void {
    this.plainContent = value
  }

  @action
  private setFileStatus(value: FileStatus): void {
    this.fileStatus = value
  }

  @action
  private setSavingText(value: boolean): void {
    this.isSavingText = value
  }

  private handlePlainContentChange = (content?: string): void => {
    this.detectedLanguage =
      content && content !== ""
        ? detectLanguage(content.substr(0, AddTextDialogStore.languageDetectionSampleLength))
        : undefined
  }

  private handleBookFileMetadataChange(metadata: IBookFileMetadata | undefined): void {
    if (metadata && metadata.language) {
      this.detectedLanguage = languageFromCodeGt(metadata.language.substr(0, 2))
    }
  }
}

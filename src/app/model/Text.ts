import { languageFromCode6393 } from "~/util/LanguageUtils"

import {
  ILanguage,
  ITextInfo,
  ITextProgress,
  ITextSectionInfo,
  ITokenizedTextContent,
  LanguageFlag
} from "~/app/model"

export class Text {
  public static fromPersisted(data: ITextInfo): Text {
    const text = new Text()
    text._id = data.id!
    text._title = data.title
    text._author = data.author
    text._contentLanguage = languageFromCode6393(data.contentLanguage)!
    text._translationLanguage = languageFromCode6393(data.translationLanguage)!
    text._progress = {
      elementNo: data.progressElementNo,
      percentage: data.progressPercentage
    }
    return text
  }

  private _id: number
  private _title: string
  private _author: string
  private _contentLanguage: ILanguage
  private _translationLanguage: ILanguage
  private _tokenizedContent: ITokenizedTextContent
  private _elementCount: number
  private _structure?: ITextSectionInfo[]
  private _progress: ITextProgress

  public getTokenizedContentSlice(from: number, count: number): ITokenizedTextContent {
    return {
      types: this.tokenizedContent.types.slice(from, from + count),
      values: this.tokenizedContent.values.slice(from, from + count),
      startNo: from
    }
  }

  public get id(): number {
    return this._id
  }

  public get title(): string {
    return this._title
  }

  public get author(): string {
    return this._author
  }

  public get contentLanguage(): ILanguage {
    return this._contentLanguage
  }

  public get translationLanguage(): ILanguage {
    return this._translationLanguage
  }

  public get tokenizedContent(): ITokenizedTextContent {
    return this._tokenizedContent
  }

  public set tokenizedContent(value: ITokenizedTextContent) {
    this._elementCount = value.types.length
    this._tokenizedContent = value
  }

  public get elementCount(): number {
    return this._elementCount
  }

  public get structure(): ITextSectionInfo[] | undefined {
    return this._structure
  }

  public set structure(value: ITextSectionInfo[] | undefined) {
    this._structure = value
  }

  public get progress(): ITextProgress | undefined {
    return this._progress
  }

  public get isRtl(): boolean {
    return (this.contentLanguage.flags & LanguageFlag.Rtl) > 0
  }

  public get areTranslationsRtl(): boolean {
    return (this.translationLanguage.flags & LanguageFlag.Rtl) > 0
  }
}

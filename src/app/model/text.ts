import { languageFromCode6393 } from "~/util/languageUtils";

import {
  Language,
  LanguageFlag,
  TextInfo,
  TextProgress,
  TextSectionInfo,
  TokenizedTextContent
} from "~/app/model";

export class Text {
  public static fromPersisted(data: TextInfo): Text {
    return new Text(
      data.id!,
      data.title,
      data.author,
      languageFromCode6393(data.contentLanguage)!,
      languageFromCode6393(data.translationLanguage)!,
      {
        elementNo: data.progressElementNo,
        percentage: data.progressPercentage
      }
    );
  }

  constructor(
    private _id: number,
    private _title: string,
    private _author: string,
    private _contentLanguage: Language,
    private _translationLanguage: Language,
    private _progress: TextProgress,
    private _elementCount: number = 0,
    private _tokenizedContent?: TokenizedTextContent,
    private _structure?: TextSectionInfo[]
  ) {}

  public getTokenizedContentSlice(from: number, count: number): TokenizedTextContent | undefined {
    if (!this.tokenizedContent) {
      return undefined;
    }

    return {
      types: this.tokenizedContent.types.slice(from, from + count),
      values: this.tokenizedContent.values.slice(from, from + count),
      startNo: from
    };
  }

  public get id(): number {
    return this._id;
  }

  public get title(): string {
    return this._title;
  }

  public get author(): string {
    return this._author;
  }

  public get contentLanguage(): Language {
    return this._contentLanguage;
  }

  public get translationLanguage(): Language {
    return this._translationLanguage;
  }

  public get tokenizedContent(): TokenizedTextContent | undefined {
    return this._tokenizedContent;
  }

  public set tokenizedContent(value: TokenizedTextContent | undefined) {
    if (value) {
      this._elementCount = value.types.length;
    }
    this._tokenizedContent = value;
  }

  public get elementCount(): number {
    return this._elementCount;
  }

  public get structure(): TextSectionInfo[] | undefined {
    return this._structure;
  }

  public set structure(value: TextSectionInfo[] | undefined) {
    this._structure = value;
  }

  public get progress(): TextProgress | undefined {
    return this._progress;
  }

  public get isRtl(): boolean {
    return (this.contentLanguage.flags & LanguageFlag.Rtl) > 0;
  }

  public get areTranslationsRtl(): boolean {
    return (this.translationLanguage.flags & LanguageFlag.Rtl) > 0;
  }
}

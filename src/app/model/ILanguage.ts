export interface ILanguage {
  name: string
  nativeName: string
  codeGt: string
  code6393: string
  flags: number
}

export enum LanguageFlag {
  None = 0,
  Spaceless = 1 << 1,
  Rtl = 1 << 2
}

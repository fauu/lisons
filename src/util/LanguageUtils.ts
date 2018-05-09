import { languages } from "~/app/data/Languages"
import { ILanguage } from "~/app/model"

export const languageFromCode6393 = (code6393: string): ILanguage | undefined =>
  languages.find(l => l.code6393 === code6393)

export const languageFromCodeGt = (codeGt: string): ILanguage | undefined =>
  languages.find(l => l.codeGt === codeGt)

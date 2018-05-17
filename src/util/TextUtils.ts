import * as franc from "franc-min"

import { Language } from "~/app/model"

import { languageFromCode6393 } from "~/util/LanguageUtils"

export const isEpub = (maybeEpub: any): boolean =>
  maybeEpub && maybeEpub.hasOwnProperty("markedContent")

export const detectLanguage = (input: string): Language | undefined => {
  return languageFromCode6393(franc(input))
}

export const takeSample = (rawTextContent: string, length: number) => {
  return rawTextContent.substr(0, length)
}

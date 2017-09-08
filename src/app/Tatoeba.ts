import levenshteinDistance = require("~/vendor/natural/LevenshteinDistance")

import { ILanguage, LanguageFlag } from "~/app/model"
import { xhr } from "~/app/Xhr"

const parser = new DOMParser()

export interface ISentenceWithTranslations {
  sentence: string
  sentenceLanguage: ILanguage
  translationsLanguage: ILanguage
  translations: string[]
}

const fetchSentencesDocument = async (
  query: string,
  fromLang: string,
  toLang: string
): Promise<Document> => {
  const res = await xhr<string>(
    `
https://tatoeba.org/eng/sentences\
/search?from=${fromLang}&to=${toLang}&query=${query}
    `
  )
  return parser.parseFromString(res, "text/html")
}

export const fetchSentences = async (
  phrase: string,
  from: ILanguage,
  to: ILanguage
): Promise<ISentenceWithTranslations[]> => {
  const doc = await fetchSentencesDocument(encodeURI(phrase), from.code6393, to.code6393)
  return [...doc.querySelectorAll(".sentence-and-translations")].map(sat => {
    const sentence = sat.querySelector(".sentence > .text")!.innerHTML.trim()
    const translations: string[] = []
    const translationElements = sat.querySelectorAll(".translation > .text")
    translationElements.forEach(te => translations.push(te.innerHTML.trim()))
    return {
      sentence,
      sentenceLanguage: from,
      translationsLanguage: to,
      translations
    }
  })
}

export const getSentenceCount = async (fromLang: string, toLang: string): Promise<number> => {
  const doc = await fetchSentencesDocument("", fromLang, toLang)
  const mainContentHeader = doc.querySelector(".section > h2")
  if (!mainContentHeader) {
    return 0
  }
  const content = mainContentHeader.textContent
  if (!content) {
    return 0
  }
  const match = content.match(/of (\d+)/)
  if (!match) {
    return 0
  }
  return parseInt(match[1], 10)
}

export const emphasizePhrase = (phrase: string, swt: ISentenceWithTranslations) => {
  const searchResult = levenshteinDistance(phrase, swt.sentence, {
    search: true
  }) as any
  const isSpaceless = swt.sentenceLanguage.flags & LanguageFlag.Spaceless
  if (searchResult.distance <= 5 && !isSpaceless) {
    const match = swt.sentence.match(new RegExp(`\\S*${searchResult.substring}\\S*`))
    if (match) {
      phrase = match[0]
    }
  }
  return {
    ...swt,
    sentence: swt.sentence.replace(new RegExp(`(${phrase})`, "gi"), "<em>$1</em>")
  }
}

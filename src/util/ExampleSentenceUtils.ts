import levenshteinDistance = require("~/vendor/natural/LevenshteinDistance")

import { LanguageFlag, SentenceWithTranslations } from "~/app/model"

export const emphasizePhrase = (phrase: string, swt: SentenceWithTranslations) => {
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

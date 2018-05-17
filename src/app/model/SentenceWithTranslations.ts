import { Language } from "~/app/model"

export interface SentenceWithTranslations {
  sentence: string
  sentenceLanguage: Language
  translationsLanguage: Language
  translations: string[]
}

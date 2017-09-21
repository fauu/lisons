import { ILanguage } from "~/app/model"

export interface ISentenceWithTranslations {
  sentence: string
  sentenceLanguage: ILanguage
  translationsLanguage: ILanguage
  translations: string[]
}

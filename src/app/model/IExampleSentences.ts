import { ISentenceWithTranslations } from "~/app/model"

export interface IExampleSentences {
  data: ISentenceWithTranslations[]
  sourceDomain: string
  sourceUrl: string
}

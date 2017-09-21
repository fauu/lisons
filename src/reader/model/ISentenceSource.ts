import { IExampleSentences, ILanguage } from "~/app/model"

export interface ISentenceSource {
  name: string
  fetchSentences: (phrase: string, from: ILanguage, to: ILanguage) => Promise<IExampleSentences>
}

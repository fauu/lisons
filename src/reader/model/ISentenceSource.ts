import { IExampleSentences, ILanguage } from "~/app/model"

import { ISource } from "~/reader/model"

export interface ISentenceSource extends ISource {
  fetchSentences: (phrase: string, from: ILanguage, to: ILanguage) => Promise<IExampleSentences>
}

import { ExampleSentences, Language } from "~/app/model"

import { Source } from "~/reader/model"

export interface SentenceSource extends Source {
  fetchSentences: (phrase: string, from: Language, to: Language) => Promise<ExampleSentences>
}

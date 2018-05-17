import { SentenceSource, Source } from "~/reader/model"

export interface Sources {
  mainTranslationSource: Source
  dictionarySource: Source
  sentencesSource: SentenceSource
}

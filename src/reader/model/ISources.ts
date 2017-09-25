import { ISentenceSource, ISource } from "~/reader/model"

export interface ISources {
  mainTranslationSource: ISource
  dictionarySource: ISource
  sentencesSource: ISentenceSource
}

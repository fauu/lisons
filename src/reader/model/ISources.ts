import { ISentenceSource } from "~/reader/model"

export type TranslationSource = "DeepL" | "Google"
export type DictionarySource = "Google"

export interface ISources {
  translationSource: TranslationSource
  dictionarySource: DictionarySource
  sentencesSource: ISentenceSource
}

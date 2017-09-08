export type TranslationSource = "DeepL" | "Google"
export type DictionarySource = "Google"
export type SentencesSource = "Tatoeba"

export interface ISources {
  translationSource: TranslationSource
  dictionarySource: DictionarySource
  sentencesSource: SentencesSource
}

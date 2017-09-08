export interface IGoogleResponse {
  dict?: IGoogleResponseDictionaryEntry[]
  sentences: IGoogleResponseSentence[]
  src: string
}

interface IGoogleResponseSentence {
  backend: number
  orig: string
  trans: string
}

interface IGoogleResponseDictionaryEntry {
  base_form: string
  entry: IGoogleResponseDictionaryEntryDefinition[]
  pos: string
  pos_enum: string
  terms: string[]
}

interface IGoogleResponseDictionaryEntryDefinition {
  reverse_translation: string[]
  score: number
  word: string
}

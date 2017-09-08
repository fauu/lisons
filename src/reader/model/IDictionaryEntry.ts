export interface IDictionaryEntry {
  word: string
  partOfSpeech: string
  variants: IDictionaryEntryVariant[]
}

export interface IDictionaryEntryVariant {
  translation: string
  reverseTranslations: string[]
}

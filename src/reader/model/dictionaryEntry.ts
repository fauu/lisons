export interface DictionaryEntry {
  word: string;
  partOfSpeech: string;
  variants: DictionaryEntryVariant[];
}

export interface DictionaryEntryVariant {
  translation: string;
  reverseTranslations: string[];
}

import { IDictionaryEntry } from "~/reader/model"

export interface ITranslation {
  full: string
  dictionaryEntries?: IDictionaryEntry[]
}

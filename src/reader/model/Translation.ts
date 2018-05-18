import { DictionaryEntry } from "~/reader/model";

export interface Translation {
  full: string;
  dictionaryEntries?: DictionaryEntry[];
}

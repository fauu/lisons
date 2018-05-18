export interface GoogleResponse {
  dict?: GoogleResponseDictionaryEntry[];
  sentences: GoogleResponseSentence[];
  src: string;
}

interface GoogleResponseSentence {
  backend: number;
  orig: string;
  trans: string;
}

interface GoogleResponseDictionaryEntry {
  base_form: string;
  entry: GoogleResponseDictionaryEntryDefinition[];
  pos: string;
  pos_enum: string;
  terms: string[];
}

interface GoogleResponseDictionaryEntryDefinition {
  reverse_translation: string[];
  score: number;
  word: string;
}

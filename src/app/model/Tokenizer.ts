import { TokenizedTextContent } from "~/app/model"

// TODO: Move to app/tokenization?
export interface Tokenizer {
  tokenize: (rawTextContent: string, options?: any) => Promise<[TokenizedTextContent, number[]]>
}

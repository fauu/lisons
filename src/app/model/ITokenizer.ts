import { ITokenizedTextContent } from "~/app/model"

// TODO: Move to app/tokenization?
export interface ITokenizer {
  tokenize: (rawTextContent: string, options?: any) => Promise<[ITokenizedTextContent, number[]]>
}

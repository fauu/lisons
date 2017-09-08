import { ITokenizedTextContent } from "~/app/model"

export interface ITokenizer {
  tokenize: (text: string, options?: {}) => Promise<ITokenizedTextContent>
}

import { ITokenizedTextContent } from "~/app/model"

export interface ITokenizer {
  tokenize: (text: string, options?: any) => Promise<ITokenizedTextContent>
}

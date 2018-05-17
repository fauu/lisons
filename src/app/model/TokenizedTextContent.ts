import { TextTokenType } from "~/app/model"

export interface TokenizedTextContent {
  types: TextTokenType[]
  values: string[]
  startNo: number
}

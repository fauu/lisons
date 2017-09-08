import { TextTokenType } from "~/app/model"

export interface ITokenizedTextContent {
  types: TextTokenType[]
  values: string[]
  startNo: number
}

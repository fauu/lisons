import { ITextSectionInfo, TextTokenType } from "~/app/model"

export interface ITextContent {
  id?: number
  textId: number
  elementCount: number
  elementTypes: TextTokenType[]
  elementValues: string[]
  structure?: ITextSectionInfo[]
}

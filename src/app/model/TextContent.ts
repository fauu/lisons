import { TextSectionInfo, TextTokenType } from "~/app/model"

export interface TextContent {
  id?: number
  textId: number
  elementCount: number
  elementTypes: TextTokenType[]
  elementValues: string[]
  structure?: TextSectionInfo[]
}

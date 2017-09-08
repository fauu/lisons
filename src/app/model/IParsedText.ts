export interface IParsedText {
  content?: string
  sections?: IParsedTextSection[]
  sample: string
}

export interface IParsedTextSection {
  id: string
  name?: string
  content: string
}

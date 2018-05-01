import { punctuationLikeChars } from "~/app/data/PunctuationLikeChars"
import { ITokenizedTextContent, ITokenizer } from "~/app/model"
import { TextTokenType } from "~/app/model/TextTokenType"

export class StandardTokenizer implements ITokenizer {
  private static readonly regexp = new RegExp(
    `( {####SECTIONSTART} )|([\r\n]+)|([^${punctuationLikeChars}\r\n]+)|([${punctuationLikeChars}]+)`,
    "g"
  )

  public tokenize(rawTextContent: string): Promise<[ITokenizedTextContent, number[]]> {
    const types = []
    const values = []
    const sectionStartElementNos = []
    let match
    let type
    let value
    let currentElementNo = 0
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = StandardTokenizer.regexp.exec(rawTextContent)) !== null) {
      const [sectionMarker, paragraphBreak, word, punctuation] = match.slice(1, 5)
      if (sectionMarker) {
        sectionStartElementNos.push(currentElementNo)
        continue
      } else if (word) {
        type = TextTokenType.Word
        value = word
      } else if (punctuation) {
        type = TextTokenType.Punctuation
        value = punctuation
      } else if (paragraphBreak) {
        type = TextTokenType.ParagraphBreak
        value = paragraphBreak
      } else {
        continue
      }
      types.push(type)
      values.push(value)
      currentElementNo++
    }
    return Promise.resolve([{ types, values, startNo: 0 }, sectionStartElementNos] as [
      ITokenizedTextContent,
      number[]
    ])
  }
}

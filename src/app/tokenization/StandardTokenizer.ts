import { punctuationLikeChars } from "~/app/data/PunctuationLikeChars"
import { ITokenizedTextContent, ITokenizer } from "~/app/model"
import { TextTokenType } from "~/app/model/TextTokenType"

export class StandardTokenizer implements ITokenizer {
  private static readonly regexp = new RegExp(
    `([\r\n]+)|([^${punctuationLikeChars}\r\n]+)|([${punctuationLikeChars}]+)`,
    "g"
  )

  public tokenize(text: string): Promise<ITokenizedTextContent> {
    const types = []
    const values = []
    let match
    let type
    let value
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = StandardTokenizer.regexp.exec(text)) !== null) {
      const [paragraphBreak, word, punctuation] = match.slice(1, 4)
      if (word) {
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
    }
    return Promise.resolve({ types, values, startNo: 0 })
  }
}

// TODO: Typed import
// tslint:disable-next-line:no-var-requires
const kuromoji = require("kuromoji")

import { punctuationLikeChars } from "~/app/data/PunctuationLikeChars"
import { ITokenizedTextContent, ITokenizer, TextTokenType } from "~/app/model"

export class KuromojiTokenizer implements ITokenizer {
  private static readonly punctuationRegexp = new RegExp(`[${punctuationLikeChars}]+`, "g")
  private static readonly paragraphBreakRegexp = /[\r\n]/g
  private static readonly vendorDictPath = "node_modules/kuromoji/dict"

  private _vendorTokenizer: any

  public async tokenize(text: string): Promise<ITokenizedTextContent> {
    const vendorTokenizer = await this.getVendorTokenizer()
    const kuromojiTokens = vendorTokenizer.tokenize(text)
    const types = []
    const values = []
    let type
    for (const t of kuromojiTokens) {
      const element = t.surface_form
      if (KuromojiTokenizer.punctuationRegexp.test(element)) {
        type = TextTokenType.Punctuation
      } else if (KuromojiTokenizer.paragraphBreakRegexp.test(element)) {
        type = TextTokenType.ParagraphBreak
      } else {
        type = TextTokenType.Word
      }
      types.push(type)
      values.push(element)
    }
    return { types, values, startNo: 0 }
  }

  private getVendorTokenizer(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this._vendorTokenizer) {
        resolve(this._vendorTokenizer)
      }
      kuromoji
        .builder({
          dicPath: KuromojiTokenizer.vendorDictPath
        })
        .build((err: any, tokenizer: any) => {
          if (err) {
            reject(err)
          }
          this._vendorTokenizer = tokenizer
          resolve(tokenizer)
        })
    })
  }
}

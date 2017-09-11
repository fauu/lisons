import { punctuationLikeChars } from "~/app/data/PunctuationLikeChars"
import {
  ChineseCharactersType,
  ITokenizedTextContent,
  ITokenizer,
  TextTokenType
} from "~/app/model"

export class ChineseTokenizer implements ITokenizer {
  private static readonly punctuationRegexp = new RegExp(`[${punctuationLikeChars}]+`, "g")
  private static readonly paragraphBreakRegexp = /[\r\n]/g
  private static readonly vendorDictPath = "out/cedict_ts.u8"

  private _tokenizers = {
    simplified: undefined,
    traditional: undefined
  }

  public async tokenize(
    text: string,
    { charactersType }: { charactersType: ChineseCharactersType }
  ): Promise<ITokenizedTextContent> {
    const vendorTokenizer = await this.getVendorTokenizer(charactersType)
    const vendorTokens = vendorTokenizer.tokenize(text)
    const types = []
    const values = []
    let type
    for (const t of vendorTokens) {
      const element = t[charactersType]
      if (ChineseTokenizer.punctuationRegexp.test(element)) {
        type = TextTokenType.Punctuation
      } else if (ChineseTokenizer.paragraphBreakRegexp.test(element)) {
        type = TextTokenType.ParagraphBreak
      } else {
        type = TextTokenType.Word
      }
      types.push(type)
      values.push(element)
    }
    return { types, values, startNo: 0 }
  }

  private getVendorTokenizer(type: ChineseCharactersType): Promise<any> {
    return new Promise((resolve, _) => {
      if (this._tokenizers[type]) {
        resolve(this._tokenizers[type])
      }
      const args = [ChineseTokenizer.vendorDictPath]
      if (type === "traditional") {
        args.push("traditional")
      }
      this._tokenizers[type] = require("chinese-tokenizer")(...args)
      resolve(this._tokenizers[type])
    })
  }
}

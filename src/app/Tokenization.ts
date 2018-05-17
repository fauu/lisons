import * as kuromoji from "kuromoji"

import { punctuationLikeChars } from "~/app/data/PunctuationLikeChars"
import { ILanguage } from "~/app/model"

export const getWrapWordsInTagsFn = (contentLanguage: ILanguage) => {
  switch (contentLanguage.code6393) {
    case "jpn":
      return wrapWordsInTagsJpn
    case "cmn":
      return wrapWordsInTagsCn("simplified")
    case "lzh":
      return wrapWordsInTagsCn("traditional")
    default:
      return wrapWordsInTagsStd
  }
}

const wordRegexp = new RegExp(`([^${punctuationLikeChars}\r\n]+)`, "g")

const wrapWordsInTagsStd = (s: string): Promise<[string, number]> => {
  let wordCount = 0
  const sWithWordsWrapped = s.replace(wordRegexp, substring => {
    wordCount++
    return `<w>${substring}</w>`
  })
  return new Promise((resolve, _reject) => resolve([sWithWordsWrapped, wordCount]))
}

type kuromojiTokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>
const { wrapWordsInTagsJpn } = new class {
  private tokenizer?: kuromojiTokenizer

  public wrapWordsInTagsJpn = async (s: string): Promise<[string, number]> => {
    if (!this.tokenizer) {
      this.tokenizer = await new Promise<kuromojiTokenizer>((resolve, reject) => {
        kuromoji
          .builder({
            dicPath: ""
          })
          .build((err, tokenizer) => {
            if (err) {
              reject(err)
            }
            resolve(tokenizer)
          })
      })
    }
    return this.tokenizer.tokenize(s).reduce<[string, number]>(
      ([acc, wordCount]: [string, number], token: kuromoji.IpadicFeatures) => {
        const element = token.surface_form
        const isAWord = wordRegexp.test(element)
        return isAWord ? [acc + `<w>${element}</w>`, wordCount + 1] : [acc + element, wordCount]
      },
      ["", 0]
    )
  }
}()

const { wrapWordsInTagsCn } = new class {
  private tokenizer: any

  public wrapWordsInTagsCn = (charactersType: string) => async (
    s: string
  ): Promise<[string, number]> => {
    if (!this.tokenizer) {
      this.tokenizer = require("chinese-tokenizer").loadFile("out/cedict_ts.u8")
    }
    return this.tokenizer(s).reduce(
      ([acc, wordCount]: [string, number], token: any) => {
        const element = token[charactersType]
        const isAWord = token.matches.length > 0
        return isAWord ? [acc + `<w>${element}</w>`, wordCount + 1] : [acc + element, wordCount]
      },
      ["", 0]
    )
  }
}()

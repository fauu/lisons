import { ILanguage, ITokenizedTextContent, ITokenizer } from "~/app/model"
import { ChineseTokenizer } from "~/app/tokenization/ChineseTokenizer"
import { KuromojiTokenizer } from "~/app/tokenization/KuromojiTokenizer"
import { SimpleTokenizer } from "~/app/tokenization/SimpleTokenizer"

let simpleTokenizer: SimpleTokenizer
let kuromojiTokenizer: KuromojiTokenizer
let chineseTokenizer: ChineseTokenizer
const getTokenizer = (language: ILanguage): ITokenizer => {
  if (language.code6393 === "jpn") {
    if (!kuromojiTokenizer) {
      kuromojiTokenizer = new KuromojiTokenizer()
    }
    return kuromojiTokenizer
  } else if (["cmn", "lzh"].includes(language.code6393)) {
    if (!chineseTokenizer) {
      chineseTokenizer = new ChineseTokenizer()
    }
    return chineseTokenizer
  } else {
    if (!simpleTokenizer) {
      simpleTokenizer = new SimpleTokenizer()
    }
    return simpleTokenizer
  }
}

const getOpts = (language: ILanguage): {} | undefined => {
  let opts
  if (language.code6393 === "cmn") {
    opts = { charactersType: "simplified" }
  } else if (language.code6393 === "lzh") {
    opts = { charactersType: "traditional" }
  }
  return opts
}

export const tokenize = async (
  text: string,
  language: ILanguage
): Promise<ITokenizedTextContent> => {
  return getTokenizer(language).tokenize(text, getOpts(language))
}

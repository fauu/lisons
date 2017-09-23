import { ILanguage, ITokenizedTextContent, ITokenizer } from "~/app/model"
import { ChineseTokenizer } from "~/app/tokenization/ChineseTokenizer"
import { KuromojiTokenizer } from "~/app/tokenization/KuromojiTokenizer"
import { StandardTokenizer } from "~/app/tokenization/StandardTokenizer"

interface ITokenizerConstructor {
  new (): ITokenizer
}

const tokenizerConstructors: { [name: string]: ITokenizerConstructor } = {
  chinese: ChineseTokenizer,
  kuromoji: KuromojiTokenizer,
  standard: StandardTokenizer
}

const tokenizerInstances: Map<string, ITokenizer | undefined> = new Map([
  ["standard", undefined],
  ["chinese", undefined],
  ["kuromoji", undefined]
])

const languageCodeToTokenizerName = new Map([
  ["jpn", "kuromoji"],
  ["cmn", "chinese"],
  ["lzh", "chinese"]
])

const languageOpts = new Map([
  ["cmn", { charactersType: "simplified" }],
  ["lzh", { charactersType: "traditional" }]
])

const defaultTokenizerName = "standard"

const getTokenizer = (language: ILanguage): ITokenizer => {
  const tokenizerName = languageCodeToTokenizerName.get(language.code6393) || defaultTokenizerName
  let tokenizerInstance = tokenizerInstances.get(tokenizerName)
  if (!tokenizerInstance) {
    tokenizerInstance = new tokenizerConstructors[tokenizerName]()
    tokenizerInstances.set(tokenizerName, tokenizerInstance)
  }
  return tokenizerInstance
}

export const tokenize = async (
  text: string,
  language: ILanguage
): Promise<ITokenizedTextContent> => {
  return getTokenizer(language).tokenize(text, languageOpts.get(language.code6393))
}

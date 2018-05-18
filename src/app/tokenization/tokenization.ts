import { Language, TokenizedTextContent, Tokenizer } from "~/app/model";
import { ChineseTokenizer } from "~/app/tokenization/chineseTokenizer";
import { KuromojiTokenizer } from "~/app/tokenization/kuromojiTokenizer";
import { StandardTokenizer } from "~/app/tokenization/standardTokenizer";

interface TokenizerConstructor {
  new (): Tokenizer;
}

const tokenizerConstructors: { [name: string]: TokenizerConstructor } = {
  chinese: ChineseTokenizer,
  kuromoji: KuromojiTokenizer,
  standard: StandardTokenizer
};

const tokenizerInstances: Map<string, Tokenizer | undefined> = new Map([
  ["standard", undefined],
  ["chinese", undefined],
  ["kuromoji", undefined]
]);

const languageCodeToTokenizerName = new Map([
  ["jpn", "kuromoji"],
  ["cmn", "chinese"],
  ["lzh", "chinese"]
]);

const languageOpts = new Map([
  ["cmn", { charactersType: "simplified" }],
  ["lzh", { charactersType: "traditional" }]
]);

const defaultTokenizerName = "standard";

const getTokenizer = (language: Language): Tokenizer => {
  const tokenizerName = languageCodeToTokenizerName.get(language.code6393) || defaultTokenizerName;
  let tokenizerInstance = tokenizerInstances.get(tokenizerName);
  if (!tokenizerInstance) {
    tokenizerInstance = new tokenizerConstructors[tokenizerName]();
    tokenizerInstances.set(tokenizerName, tokenizerInstance);
  }
  return tokenizerInstance;
};

export const tokenize = async (
  rawTextContent: string,
  language: Language
): Promise<[TokenizedTextContent, number[]]> => {
  return getTokenizer(language).tokenize(rawTextContent, languageOpts.get(language.code6393));
};

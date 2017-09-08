import { ILanguage } from "~/app/model"
import { xhr } from "~/app/Xhr"

import { IDeeplResponse, ITranslation } from "~/reader/model"

const supportedLanguages = ["en", "de", "pl", "es", "nl", "it", "fr"]

const getRequestObject = (s: string, from: string, to: string) => ({
  jsonrpc: 2.0,
  method: "LMT_handle_jobs",
  params: {
    jobs: [
      {
        raw_en_sentence: s
      }
    ],
    lang: {
      source_lang_user_selected: from.toUpperCase(),
      target_lang: to.toUpperCase()
    }
  }
})

export const isLanguageConfigurationSupportedByDeepl = (from: ILanguage, to: ILanguage) =>
  supportedLanguages.includes(from.codeGt) && supportedLanguages.includes(to.codeGt)

export const deeplTranslate = async (
  s: string,
  from: ILanguage,
  to: ILanguage
): Promise<ITranslation | undefined> => {
  if (!isLanguageConfigurationSupportedByDeepl(from, to)) {
    return
  }
  return xhr<IDeeplResponse>(
    "https://www.deepl.com/jsonrpc",
    getRequestObject(s, from.codeGt, to.codeGt),
    true
  ).then(res => ({
    full: res.result.translations[0].beams[0].postprocessed_sentence
  }))
}

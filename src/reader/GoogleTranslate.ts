import { ILanguage } from "~/app/model"
import { xhr } from "~/app/Xhr"

import { IDictionaryEntry, IGoogleResponse, ITranslation } from "~/reader/model"

export const googleTranslate = async (
  s: string,
  from: ILanguage,
  to: ILanguage
): Promise<ITranslation | undefined> =>
  xhr<IGoogleResponse>(
    `
https://translate.googleapis.com\
/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=icon\
&sl=${from.codeGt}\
&hl=${to.codeGt}\
&tl=${to.codeGt}\
&q=${encodeURI(s)}
    `,
    undefined,
    true
  ).then(res => {
    if (!res.sentences) {
      return
    }
    let dictionaryEntries: IDictionaryEntry[] | undefined
    if (res.dict) {
      dictionaryEntries = res.dict.map(e => ({
        word: e.base_form,
        partOfSpeech: e.pos,
        variants: e.entry.map(en => ({
          translation: en.word,
          reverseTranslations: en.reverse_translation
        }))
      }))
    }
    return {
      full: res.sentences.map(sentence => sentence.trans).join(""),
      dictionaryEntries
    }
  })

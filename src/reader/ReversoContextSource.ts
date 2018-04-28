import { IExampleSentences, ILanguage } from "~/app/model"
import { xhr } from "~/app/Xhr"

import { ISentenceSource } from "~/reader/model"

export class ReversoContextSource implements ISentenceSource {
  private static languageMap = new Map([
    ["ara", ["eng", "spa", "fra", "heb"]],
    ["deu", ["eng", "spa", "fra", "heb", "ita", "jpn", "nld", "pol", "por", "ron"]],
    ["eng", ["ara", "deu", "spa", "fra", "heb", "ita", "jpn", "nld", "pol", "por", "ron", "rus"]],
    ["spa", ["ara", "deu", "eng", "fra", "heb", "ita", "jpn", "nld", "pol", "por", "ron", "rus"]],
    ["fra", ["ara", "deu", "eng", "spa", "heb", "ita", "jpn", "nld", "pol", "por", "ron", "rus"]],
    ["heb", ["ara", "deu", "eng", "spa", "fra", "ita", "por", "rus"]],
    ["ita", ["deu", "eng", "spa", "fra", "heb", "jpn", "nld", "pol", "por", "ron", "rus"]],
    ["jpn", ["deu", "eng", "spa", "fra", "ita", "rus"]],
    ["nld", ["deu", "eng", "spa", "fra", "ita", "rus"]],
    ["pol", ["deu", "eng", "spa", "fra", "ita"]],
    ["por", ["deu", "eng", "spa", "fra", "heb", "ita"]],
    ["ron", ["deu", "eng", "spa", "fra", "ita"]],
    ["rus", ["eng", "spa", "fra", "heb", "ita", "jpn", "nld"]]
  ])

  public get name(): string {
    return "Reverso Context"
  }
  public get domain(): string {
    return "context.reverso.net"
  }
  public get url(): string {
    return `http://${this.domain}`
  }
  private parser = new DOMParser()

  public hasSentences(from: ILanguage, to: ILanguage): boolean {
    const toCodes = ReversoContextSource.languageMap.get(from.code6393)
    if (!toCodes) {
      return false
    }
    return toCodes.some(c => c === to.code6393)
  }

  public async fetchSentences(
    phrase: string,
    from: ILanguage,
    to: ILanguage
  ): Promise<IExampleSentences> {
    const sourceUrl = this.getSentencesDocumentUrl(
      encodeURI(phrase),
      this.getLanguageString(from),
      this.getLanguageString(to)
    )
    const doc = await this.fetchSentencesDocument(sourceUrl)

    return {
      data: Array.from(doc.querySelectorAll("#examples-content > .example:not(.blocked)")).map(
        sat => ({
          sentence: sat.children[0].children[0].textContent!.trim(),
          sentenceLanguage: from,
          translationsLanguage: to,
          translations: [sat.children[1].children[1].textContent!.trim()]
        })
      ),
      sourceDomain: this.domain,
      sourceUrl
    }
  }

  private getLanguageString(lang: ILanguage): string {
    return lang.name.toLowerCase()
  }

  private getSentencesDocumentUrl(query: string, fromLang: string, toLang: string): string {
    return `${this.url}/translation/${fromLang}-${toLang}/${query}`
  }

  private async fetchSentencesDocument(url: string): Promise<Document> {
    const res = await xhr<string>(url)
    return this.parser.parseFromString(res, "text/html")
  }
}

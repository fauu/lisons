import { IExampleSentences, ILanguage } from "~/app/model"
import { xhr } from "~/app/Xhr"

import { ISentenceSource } from "~/reader/model"

export class TatoebaSource implements ISentenceSource {
  public get name(): string {
    return "Tatoeba"
  }
  public get domain(): string {
    return "tatoeba.org"
  }
  public get url(): string {
    return `https://${this.domain}`
  }
  private parser = new DOMParser()

  public async fetchSentences(
    phrase: string,
    from: ILanguage,
    to: ILanguage
  ): Promise<IExampleSentences> {
    const sourceUrl = this.getSentencesDocumentUrl(encodeURI(phrase), from.code6393, to.code6393)
    const doc = await this.fetchSentencesDocument(sourceUrl)

    return {
      data: Array.from(doc.querySelectorAll(".sentence-and-translations")).map(sat => ({
        sentence: sat.querySelector(".sentence > .text")!.textContent!.trim(),
        sentenceLanguage: from,
        translationsLanguage: to,
        translations: Array.from(sat.querySelectorAll(".translation > .text")).map(te =>
          te.textContent!.trim()
        )
      })),
      sourceDomain: this.domain,
      sourceUrl
    }
  }

  private getSentencesDocumentUrl(query: string, fromLang: string, toLang: string): string {
    return `${this.url}/eng/sentences\/search?from=${fromLang}&to=${toLang}&query=${query}`
  }

  private async fetchSentencesDocument(url: string): Promise<Document> {
    const res = await xhr<string>(url)
    return this.parser.parseFromString(res, "text/html")
  }

  // public async getSentenceCount(fromLang: string, toLang: string): Promise<number> {
  //   const doc = await this.fetchSentencesDocument("", fromLang, toLang)
  //   const mainContentHeader = doc.querySelector(".section > h2")
  //   if (!mainContentHeader) {
  //     return 0
  //   }
  //   const content = mainContentHeader.textContent
  //   if (!content) {
  //     return 0
  //   }
  //   const match = content.match(/of (\d+)/)
  //   if (!match) {
  //     return 0
  //   }
  //   return parseInt(match[1], 10)
  // }
}

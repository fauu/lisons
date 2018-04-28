import zip = require("lodash/zip")
import { action, observable, runInAction } from "mobx"

import { IExampleSentences, ILanguage } from "~/app/model"
import { emphasizePhrase } from "~/util/ExampleSentenceUtils"
import { hasSpace } from "~/util/StringUtils"

import { deeplTranslate, isLanguageConfigurationSupportedByDeepl } from "~/reader/DeeplTranslate"
import { googleTranslate } from "~/reader/GoogleTranslate"
import { IDictionaryEntry, ISources, ITranslation, ResourceState } from "~/reader/model"
import { ReversoContextSource } from "~/reader/ReversoContextSource"
import { TatoebaSource } from "~/reader/TatoebaSource"

type TranslationPair = [ITranslation | undefined, ITranslation | undefined]

export class SidebarStore {
  private static readonly sources = {
    tatoeba: new TatoebaSource(),
    reversoContext: new ReversoContextSource(),
    deepl: { name: "DeepL", url: "https://www.deepl.com/translator" },
    google: { name: "Google", url: "https://translate.google.com" }
  }

  @observable public isVisible: boolean = true
  @observable public isMainTranslationLoading: boolean = false
  @observable.ref public exampleSentences?: IExampleSentences
  @observable public exampleSentencesState: ResourceState = "NotLoading"
  @observable.ref public dictionaryEntries: IDictionaryEntry[] = []
  @observable public dictionaryEntriesState: ResourceState = "NotLoading"
  @observable public isSettingsTabActive: boolean = false
  @observable
  public sources: ISources = {
    mainTranslationSource: SidebarStore.sources.google,
    dictionarySource: SidebarStore.sources.google,
    sentencesSource: SidebarStore.sources.tatoeba
  }

  @action
  public updateSources(contentLanguage: ILanguage, translationLanguage: ILanguage): void {
    const canDoDeeplTranslation = isLanguageConfigurationSupportedByDeepl(
      contentLanguage,
      translationLanguage
    )
    this.sources.mainTranslationSource = canDoDeeplTranslation
      ? SidebarStore.sources.deepl
      : SidebarStore.sources.google

    const canGetRCSentences = SidebarStore.sources.reversoContext.hasSentences(
      contentLanguage,
      translationLanguage
    )
    this.sources.sentencesSource = canGetRCSentences
      ? SidebarStore.sources.reversoContext
      : SidebarStore.sources.tatoeba
  }

  public update = async (
    selectedText: string,
    contentLanguage: ILanguage,
    translationLanguage: ILanguage,
    translationCallback: (translation: string) => void
  ): Promise<void> => {
    if (!selectedText) {
      this.setResourcesNotLoading()
      return
    }

    this.setMainTranslationLoading()

    if (this.isVisible) {
      this.setDictionaryEntriesState("Loading")
      this.fetchExampleSentences(selectedText, contentLanguage, translationLanguage)
    }

    const [googleTranslation, deeplTranslation] = await this.fetchTranslations(
      selectedText,
      contentLanguage,
      translationLanguage
    )
    const mainTranslation = deeplTranslation || googleTranslation
    if (mainTranslation) {
      translationCallback(mainTranslation.full)
    }
    this.setMainTranslationLoading(false)

    if (this.isVisible) {
      runInAction(() => {
        this.dictionaryEntries = (googleTranslation && googleTranslation.dictionaryEntries) || []
        this.dictionaryEntriesState = "Loaded"
      })
    }
  }

  @action.bound
  public hide(): void {
    this.isVisible = false
    this.isSettingsTabActive = false
  }

  @action.bound
  public toggleSettings(): void {
    this.isVisible = true
    this.isSettingsTabActive = !this.isSettingsTabActive
  }

  @action
  public setVisible(value: boolean = true): void {
    this.isVisible = value
  }

  @action
  public setMainTranslationLoading(value: boolean = true): void {
    this.isMainTranslationLoading = value
  }

  @action
  public setSettingsTabActive(value: boolean = true): void {
    this.isSettingsTabActive = value
  }

  @action
  public setResourcesNotLoading(): void {
    this.exampleSentences = undefined
    this.exampleSentencesState = "NotLoading"
    this.dictionaryEntries = []
    this.dictionaryEntriesState = "NotLoading"
  }

  @action
  private setExampleSentencesState(value: ResourceState): void {
    this.exampleSentencesState = value
  }

  @action
  private setDictionaryEntriesState(value: ResourceState): void {
    this.dictionaryEntriesState = value
  }

  private async fetchExampleSentences(
    phrase: string,
    contentLanguage: ILanguage,
    translationLanguage: ILanguage
  ): Promise<void> {
    this.setExampleSentencesState("Loading")
    const exampleSentences = await this.sources.sentencesSource.fetchSentences(
      phrase,
      contentLanguage,
      translationLanguage
    )
    runInAction(() => {
      this.exampleSentences = {
        ...exampleSentences,
        data: exampleSentences.data.map(s => emphasizePhrase(phrase, s))
      }
      this.exampleSentencesState = "Loaded"
    })
  }

  private async fetchTranslations(
    phrase: string,
    contentLanguage: ILanguage,
    translationLanguage: ILanguage
  ): Promise<TranslationPair> {
    const isSingleWord = !hasSpace(phrase)
    const canDoDeeplTranslation = this.sources.mainTranslationSource.name === "DeepL"

    const willDoGoogleTranslation = !canDoDeeplTranslation || isSingleWord
    const willDoDeeplTranslation =
      canDoDeeplTranslation && !(willDoGoogleTranslation && !this.isVisible)

    const translationPromises = (zip<boolean | typeof googleTranslate>(
      [willDoGoogleTranslation, willDoDeeplTranslation],
      [googleTranslate, deeplTranslate]
    ) as Array<[boolean, typeof googleTranslate]>).map(
      ([condition, func]: [boolean, typeof googleTranslate]) => {
        if (condition) {
          return func(phrase, contentLanguage, translationLanguage)
        }
        return
      }
    )

    return Promise.all(translationPromises) as Promise<TranslationPair>
  }
}

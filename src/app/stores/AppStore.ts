import { remote } from "electron"
import { action, observable, runInAction } from "mobx"

import { LibraryStore } from "~/library/stores"
import { ReaderStore } from "~/reader/stores"

import { Database } from "~/app/Database"
import { AppScreen } from "~/app/model"
import { SettingsStore, TextStore } from "~/app/stores"
import { TextRepository } from "~/app/TextRepository"
import { xhr } from "~/app/Xhr"

export class AppStore {
  public static readonly websiteUrl = "https://fauu.github.io/lisons"
  private static readonly websiteDataPath = "/data.json"
  private static readonly startInReader = false

  @observable public activeScreen?: AppScreen
  @observable public isFullScreen: boolean
  @observable private _newestVersion?: string
  private _db: Database
  private _textRepository: TextRepository
  private _settingsStore: SettingsStore
  private _textStore: TextStore
  private _libraryStore: LibraryStore
  private _readerStore: ReaderStore

  public constructor() {
    this.init()
  }

  public async init(): Promise<void> {
    this._db = new Database()
    this._textRepository = new TextRepository(this._db)
    this._settingsStore = new SettingsStore()
    await this._settingsStore.init()
    this._textStore = new TextStore(this._textRepository)
    this._libraryStore = new LibraryStore(this._textStore)
    this._readerStore = new ReaderStore(this._textStore)
    await this._textStore.loadAll()
    if (AppStore.startInReader) {
      this.showReaderScreen(parseInt(this._textStore.texts.keys()[0], 10))
    } else {
      this.showLibraryScreen()
    }
    this.fetchCurrentVersion()
  }

  public async showReaderScreen(textId: number): Promise<void> {
    const text = await this._textRepository.loadOneWithContent(textId)
    if (text) {
      this._readerStore.setText(text)
      this.setActiveScreen("Reader")
    }
  }

  public showLibraryScreen(): void {
    this.setActiveScreen("Library")
  }

  @action
  public toggleFullScreen(): void {
    const win = remote.getCurrentWindow()
    this.isFullScreen = !win.isFullScreen()
    win.setFullScreen(this.isFullScreen)
  }

  private async fetchCurrentVersion(): Promise<void> {
    let websiteData: any
    try {
      const url = `${AppStore.websiteUrl}${AppStore.websiteDataPath}`
      websiteData = await xhr<{ version: string }>(url, undefined, true)
    } catch (e) {
      console.error("Error fetching website data:", e)
    }
    runInAction(() => {
      this._newestVersion = websiteData && websiteData.version
    })
  }

  public get isNewVersionAvailable(): boolean {
    return this._newestVersion !== undefined && this._newestVersion !== VERSION
  }

  public get settingsStore(): SettingsStore {
    return this._settingsStore
  }

  public get textStore(): TextStore {
    return this._textStore
  }

  public get libraryStore(): LibraryStore {
    return this._libraryStore
  }

  public get readerStore(): ReaderStore {
    return this._readerStore
  }

  @action
  private setActiveScreen(value: AppScreen): void {
    this.activeScreen = value
  }
}

import { remote } from "electron";
import { action, observable } from "mobx";

import { LibraryStore } from "~/library/stores";
import { ReaderStore } from "~/reader/stores";

import { AppScreen } from "~/app/model";
import { SettingsStore, TextStore } from "~/app/stores";
import { xhr } from "~/app/xhr";

export class AppStore {
  public static readonly websiteUrl = "https://fauu.github.io/lisons";
  private static readonly websiteDataPath = "/data.json";
  private static readonly startInReader = false;

  @observable public activeScreen?: AppScreen;
  @observable public isFullScreen: boolean = false;
  @observable private _newestVersion?: string;
  private _settingsStore!: SettingsStore;
  private _textStore!: TextStore;
  private _libraryStore!: LibraryStore;
  private _readerStore!: ReaderStore;

  public constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    this._settingsStore = new SettingsStore();
    this._settingsStore.init();
    this._textStore = new TextStore();
    this._libraryStore = new LibraryStore(this._settingsStore, this._textStore);
    this._textStore.loadFromDisk();
    this._readerStore = new ReaderStore(this._textStore);
    if (AppStore.startInReader) {
      // this.showReaderScreen(parseInt(this._textStore.texts.keys()[0], 10));
    } else {
      this.showLibraryScreen();
    }
    this.fetchCurrentVersion();
  }

  // @ts-ignore
  public async showReaderScreen(textId: number): Promise<void> {
    const text = undefined; // Loading text was here
    if (text) {
      this._readerStore.setText(text);
      this.setActiveScreen("Reader");
    }
  }

  public showLibraryScreen(): void {
    this.setActiveScreen("Library");
  }

  @action
  public toggleFullScreen(): void {
    const win = remote.getCurrentWindow();
    this.isFullScreen = !win.isFullScreen();
    win.setFullScreen(this.isFullScreen);
  }

  private async fetchCurrentVersion(): Promise<void> {
    let websiteData = { version: "0.0" };
    try {
      const url = `${AppStore.websiteUrl}${AppStore.websiteDataPath}`;
      websiteData = await xhr<{ version: string }>(url, undefined, true);
    } catch (e) {
      console.error("Error fetching website data:", e);
    }
    this.setNewestVersion(websiteData && websiteData.version);
  }

  public get isNewVersionAvailable(): boolean {
    return this._newestVersion !== undefined && this._newestVersion !== VERSION;
  }

  public get settingsStore(): SettingsStore {
    return this._settingsStore;
  }

  public get textStore(): TextStore {
    return this._textStore;
  }

  public get libraryStore(): LibraryStore {
    return this._libraryStore;
  }

  public get readerStore(): ReaderStore {
    return this._readerStore;
  }

  @action
  private setActiveScreen(value: AppScreen): void {
    this.activeScreen = value;
  }

  @action
  private setNewestVersion(version: string): void {
    this._newestVersion = version;
  }
}

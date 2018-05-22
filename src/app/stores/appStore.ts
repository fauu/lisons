import { remote } from "electron";
import { action, computed, observable, runInAction } from "mobx";

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

  @observable private latestVersion = VERSION;

  public settingsStore!: SettingsStore;
  public textStore!: TextStore;
  public libraryStore!: LibraryStore;
  public readerStore!: ReaderStore;

  public constructor() {
    this.init();
  }

  @computed
  public get isNewVersionAvailable(): boolean {
    return this.latestVersion !== undefined && this.latestVersion !== VERSION;
  }

  public async init(): Promise<void> {
    this.settingsStore = new SettingsStore();
    this.settingsStore.init();
    this.textStore = new TextStore();
    this.libraryStore = new LibraryStore(this.settingsStore, this.textStore);
    this.readerStore = new ReaderStore(this.textStore);
    await this.textStore.loadFromDisk();
    setTimeout(() => {
      if (AppStore.startInReader) {
        // this.showReaderScreen(parseInt(this._textStore.texts.keys()[0], 10));
      } else {
        this.showLibraryScreen();
      }
      this.fetchCurrentVersion();
    }, 50000);
  }

  @action
  public async showReaderScreen(_textId: number): Promise<void> {
    const text = undefined; // Loading text was here
    if (text) {
      this.readerStore.setText(text);
      this.activeScreen = "Reader";
    }
  }

  @action
  public showLibraryScreen(): void {
    this.activeScreen = "Library";
  }

  @action
  public toggleFullScreen(): void {
    const win = remote.getCurrentWindow();
    this.isFullScreen = !win.isFullScreen();
    win.setFullScreen(this.isFullScreen);
  }

  private async fetchCurrentVersion(): Promise<void> {
    try {
      const url = `${AppStore.websiteUrl}${AppStore.websiteDataPath}`;
      const websiteData = await xhr<{ version: string }>(url, undefined, true);
      runInAction(() => (this.latestVersion = websiteData && websiteData.version));
    } catch (e) {
      console.error("Error fetching website data:", e);
    }
  }
}

import { action, computed, observable, runInAction } from "mobx";

import { LibraryStore } from "~/library/stores";
import { ReaderStore } from "~/reader/stores";

import { AppScreen } from "~/app/model";
import { SettingsStore, TextStore } from "~/app/stores";
import { xhr } from "~/app/xhr";

export class AppStore {
  public static readonly websiteUrl = "https://fauu.github.io/lisons";
  private static readonly websiteDataPath = "/data.json";
  // private static readonly settingsFilename = "settings.json";
  private static readonly startInReader = false;

  @observable private _activeScreen?: AppScreen;
  @observable private _isFullScreen: boolean = false;

  @observable private latestVersion = VERSION;

  // Domain stores
  private _settingsStore!: SettingsStore;
  private _textStore!: TextStore;

  // UI stores
  private _libraryStore!: LibraryStore;
  private _readerStore!: ReaderStore;

  public constructor() {
    this.init();
  }

  @computed
  public get isNewVersionAvailable(): boolean {
    return this.latestVersion !== undefined && this.latestVersion !== VERSION;
  }

  public async init(): Promise<void> {
    this._settingsStore = new SettingsStore(
      // path.join(this.userDataPath, AppStore.settingsFilename)
      ":-DDD"
    );
    this._settingsStore.init();
    this._textStore = new TextStore();
    this._libraryStore = new LibraryStore(this._settingsStore, this._textStore);
    this._libraryStore.init();
    this._readerStore = new ReaderStore(this._textStore);
    await this._textStore.loadFromDisk();
    if (AppStore.startInReader) {
      // this.showReaderScreen(parseInt(this._textStore.texts.keys()[0], 10));
    } else {
      this.showLibraryScreen();
    }
    this.fetchCurrentVersion();
  }

  @action
  public async showReaderScreen(_textId: number): Promise<void> {
    const text = undefined; // Loading text was here
    if (text) {
      this._readerStore.setText(text);
      this._activeScreen = "Reader";
    }
  }

  @action
  public showLibraryScreen(): void {
    this._activeScreen = "Library";
  }

  @action
  public toggleFullScreen(): void {
    // FIXME
    // const win = remote.getCurrentWindow();
    // this._isFullScreen = !win.isFullScreen();
    // win.setFullScreen(this._isFullScreen);
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

  public get activeScreen(): AppScreen | undefined {
    return this._activeScreen;
  }

  public get isFullScreen(): boolean {
    return this._isFullScreen;
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
}

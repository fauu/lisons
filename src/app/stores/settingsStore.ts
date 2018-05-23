import isEqual = require("lodash/isEqual");
import { action, computed, observable, runInAction } from "mobx";

import { defaultSettings } from "~/app/data/defaultSettings";
import { Settings } from "~/app/model";

export class SettingsStore {
  @observable.deep private _settings: Settings = defaultSettings;

  // @ts-ignore
  public constructor(private filePath: string) {}

  @computed
  public get areReaderSettingsDefault(): boolean {
    return isEqual(this._settings.readerStyle, defaultSettings.readerStyle);
  }

  public async init(): Promise<void> {
    const loadedSettings = await this.loadFromDisk();
    runInAction(() => (this._settings = loadedSettings));
  }

  @action
  public set(slice: Partial<Settings>): void {
    Object.assign(this._settings, slice);
    this.syncToDisk(this._settings);
  }

  private async loadFromDisk(): Promise<Settings> {
    // const fileExists = await exists(this.filePath);
    // if (!fileExists) {
    //   this.syncToDisk(defaultSettings);
    //   return defaultSettings;
    // }
    // const rawSettings = (await readFile(this.filePath)).toString();
    return defaultSettings;
  }

  private async syncToDisk(_settings: Settings): Promise<void> {
    // writeFile<string>(this.filePath, JSON.stringify(settings));
  }

  @computed
  public get settings(): Settings {
    return this._settings;
  }
}

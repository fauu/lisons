import isEqual = require("lodash/isEqual");
import { action, computed, observable, runInAction } from "mobx";

import { defaultSettings } from "~/app/data/defaultSettings";
import { Settings } from "~/app/model";
import { loadSettings, saveSettings } from "~/app/settings";

export class SettingsStore {
  @observable.deep private _settings: Settings = defaultSettings;

  @computed
  public get areReaderSettingsDefault(): boolean {
    return isEqual(this._settings.readerStyle, defaultSettings.readerStyle);
  }

  public async init(): Promise<void> {
    const loadedSettings = await loadSettings();
    runInAction(() => (this._settings = loadedSettings));
  }

  @action
  public set(slice: Partial<Settings>): void {
    Object.assign(this._settings, slice);
    saveSettings(this._settings);
  }

  @computed
  public get settings(): Settings {
    return this._settings;
  }
}

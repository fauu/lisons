import isEqual = require("lodash/isEqual");
import { action, computed, observable } from "mobx";

import { defaultSettings } from "~/app/data/defaultSettings";
import { Settings } from "~/app/model";
import { loadSettings, saveSettings } from "~/app/settings";
import { flowed } from "~/util/mobxUtils";

export class SettingsStore {
  @observable.deep private _settings: Settings = defaultSettings;

  @flowed
  public *init(): IterableIterator<Promise<Settings>> {
    const loadedSettings = yield loadSettings();
    this._settings = loadedSettings;
  }

  @action
  public set(slice: any): void {
    Object.assign(this._settings, slice);
    saveSettings(this._settings);
  }

  @computed
  public get settings(): Settings {
    return this._settings;
  }

  @computed
  public get areReaderSettingsDefault(): boolean {
    return isEqual(this._settings.readerStyle, defaultSettings.readerStyle);
  }
}

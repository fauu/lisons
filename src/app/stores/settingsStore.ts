import isEqual = require("lodash/isEqual");
import { action, computed, observable } from "mobx";

import { defaultSettings } from "~/app/data/defaultSettings";
import { Settings } from "~/app/model";
import { loadSettings, saveSettings } from "~/app/settings";

export class SettingsStore {
  @observable.deep private _settings: Settings = defaultSettings;

  public async init(): Promise<void> {
    const loadedSettings = await loadSettings();
    this.setSettings(loadedSettings);
  }

  @action
  public set(slice: any): void {
    Object.assign(this._settings, slice);
    saveSettings(this._settings);
  }

  @action
  private setSettings(settings: Settings): void {
    this._settings = settings;
  }

  // XXX: Why is this needed again?
  @computed
  public get settings(): Settings {
    return this._settings;
  }

  @computed
  public get areReaderSettingsDefault(): boolean {
    return isEqual(this._settings.readerStyle, defaultSettings.readerStyle);
  }
}

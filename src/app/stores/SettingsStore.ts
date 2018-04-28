import isEqual = require("lodash/isEqual")
import { action, computed, observable } from "mobx"

import { defaultSettings } from "~/app/data/DefaultSettings"
import { ISettings } from "~/app/model"
import { loadSettings, saveSettings } from "~/app/Settings"

export class SettingsStore {
  @observable.deep private _settings: ISettings = defaultSettings

  public async init(): Promise<void> {
    this._settings = await loadSettings()
  }

  @action
  public set(slice: any): void {
    Object.assign(this._settings, slice)
    saveSettings(this._settings)
  }

  @computed
  public get settings(): ISettings {
    return this._settings
  }

  @computed
  public get areReaderSettingsDefault(): boolean {
    return isEqual(this._settings.readerStyle, defaultSettings.readerStyle)
  }
}

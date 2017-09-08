import { action, computed, observable } from "mobx"

import { ISettings } from "~/app/model"
import { loadSettings, saveSettings } from "~/app/Settings"

export class SettingsStore {
  @observable private _settings: ISettings

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
}

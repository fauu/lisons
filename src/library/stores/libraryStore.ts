import { SettingsStore, TextStore } from "~/app/stores";

import { AddTextDialogStore } from "~/library/stores";

export class LibraryStore {
  private _addTextDialogStore!: AddTextDialogStore;

  public constructor(private _settingsStore: SettingsStore, private _textStore: TextStore) {
    this.init();
  }

  public init(): void {
    this._addTextDialogStore = new AddTextDialogStore(this._settingsStore, this._textStore);
  }

  public get addTextDialogStore(): AddTextDialogStore {
    return this._addTextDialogStore;
  }
}

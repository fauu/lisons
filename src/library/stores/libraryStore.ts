import { SettingsStore, TextStore } from "~/app/stores";

import { AddTextDialogStore } from "~/library/stores";

export class LibraryStore {
  public addTextDialogStore!: AddTextDialogStore;

  public constructor(private _settingsStore: SettingsStore, private _textStore: TextStore) {}

  public init(): void {
    this.addTextDialogStore = new AddTextDialogStore(this._settingsStore, this._textStore);
  }
}

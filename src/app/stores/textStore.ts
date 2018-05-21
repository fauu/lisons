import { action, observable, ObservableMap, runInAction, toJS } from "mobx";
import * as path from "path";

import { LibraryEntry, ParsedText, Text, TextInfo, TextProgress } from "~/app/model";

import { deleteFile, exists, getUserDataPath, readFile, writeFile } from "~/util/fileUtils";

export class TextStore {
  private static readonly libraryPath = path.join(getUserDataPath(), "library.json");

  public texts: ObservableMap<number, Text> = observable.map<number, Text>(undefined, {
    deep: false
  });
  public library: ObservableMap<string, LibraryEntry> = observable.map<string, LibraryEntry>(
    undefined,
    { deep: false }
  );

  public async loadLibrary(): Promise<any> {
    if (await exists(TextStore.libraryPath)) {
      const loadedLibrary = JSON.parse((await readFile(TextStore.libraryPath)).toString());
      runInAction(() => this.library.replace(loadedLibrary));
    }
  }

  // XXX: Move this stuff to LibraryStore?...
  @action
  public addToLibrary(entry: LibraryEntry): void {
    this.library.set(entry.id, entry);
    this.syncLibrary();
  }

  // TODO: Magic strings out
  @action
  public deleteFromLibrary(id: string): void {
    this.library.delete(id);
    this.syncLibrary();
    deleteFile(path.join(getUserDataPath(), "texts", id));
  }

  // XXX: ...or to a repository/service (especially the I/O)?
  private syncLibrary(): void {
    writeFile<string>(
      path.join(TextStore.libraryPath),
      // TODO: Check it this.library.toJSON would work
      JSON.stringify(toJS(this.library))
    );
  }

  public async loadAll(): Promise<void> {
    console.log("to be removed");
  }

  public async add(_info: TextInfo, _parsed: ParsedText): Promise<void> {
    console.log("to be removed");
  }

  public async delete(_id: number): Promise<void> {
    console.log("to be removed");
  }

  // TODO: Make progress observable and sync automatically?
  public async setTextProgress(_id: number, _progress: TextProgress): Promise<void> {
    console.log("to be removed");
  }
}

import { action, observable, ObservableMap, toJS } from "mobx";
import * as path from "path";

import { LibraryEntry, ParsedText, Text, TextInfo, TextProgress } from "~/app/model";

import { deleteFile, exists, getUserDataPath, readFile, writeFile } from "~/util/fileUtils";
import { flowed } from "~/util/mobxUtils";

export class TextStore {
  private static readonly libraryPath = path.join(getUserDataPath(), "library.json");

  public texts: ObservableMap<number, Text> = observable.map<number, Text>(undefined, {
    deep: false
  });
  public library: ObservableMap<string, LibraryEntry> = observable.map<string, LibraryEntry>(
    undefined,
    { deep: false }
  );

  @flowed
  public *loadLibrary(): IterableIterator<Promise<any>> {
    if (yield exists(TextStore.libraryPath)) {
      this.library.replace(JSON.parse((yield readFile(TextStore.libraryPath)).toString()));
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

  @flowed
  public *loadAll(): IterableIterator<Promise<Text[]>> {
    console.log("to be removed");
  }

  public async add(_info: TextInfo, _parsed: ParsedText): Promise<void> {
    console.log("to be removed");
  }

  @flowed
  public *delete(_id: number): IterableIterator<Promise<void>> {
    console.log("to be removed");
  }

  // TODO: Make progress observable and sync automatically?
  public async setTextProgress(_id: number, _progress: TextProgress): Promise<void> {
    console.log("to be removed");
  }
}

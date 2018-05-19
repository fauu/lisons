import { action, observable, ObservableMap, toJS } from "mobx";
import * as path from "path";

import { ParsedText, Text, TextInfo, TextProgress } from "~/app/model";
import { TextRepository } from "~/app/textRepository";

import { getUserDataPath, writeFile, readFile, exists } from "~/util/fileUtils";
import { flowed } from "~/util/mobxUtils";

export interface LibraryEntry {
  id: string;
  title: string;
  author: string;
  contentLanguage: string;
  translationLanguage: string;
  coverPath: string;
}

export class TextStore {
  private static readonly libraryPath = path.join(getUserDataPath(), "library.json");

  public texts: ObservableMap<number, Text> = observable.map<number, Text>(undefined, {
    deep: false
  });
  public library: ObservableMap<string, LibraryEntry> = observable.map<string, LibraryEntry>(
    undefined,
    { deep: false }
  );

  public constructor(private _textRepository: TextRepository) {}

  public async loadLibrary(): Promise<void> {
    if (await exists(TextStore.libraryPath)) {
      this.library.replace(JSON.parse((await readFile(TextStore.libraryPath)).toString()));
      console.log("library loaded", this.library);
    }
  }

  // XXX: Move this stuff to LibraryStore?...
  @action
  public addToLibrary(entry: LibraryEntry): void {
    this.library.set(entry.id, entry);
    this.syncLibrary();
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
    const texts: Text[] = yield this._textRepository.loadAll();
    texts.forEach(t => this.texts.set(t.id, t));
  }

  public async add(info: TextInfo, parsed: ParsedText): Promise<void> {
    const newText = await this._textRepository.save(info, parsed);
    this.setText(newText);
  }

  @flowed
  public *delete(id: number): IterableIterator<Promise<void>> {
    yield this._textRepository.delete(id);
    this.texts.delete(id);
  }

  // TODO: Make progress observable and sync automatically?
  public async setTextProgress(id: number, progress: TextProgress): Promise<void> {
    const updatedText = this._textRepository.updateProgress(id, progress);
    this.setText(await updatedText);
  }

  @action
  private setText(text: Text): void {
    this.texts.set(text.id, text);
  }
}

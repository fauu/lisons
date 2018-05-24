import { action, computed, observable, ObservableMap, runInAction } from "mobx";

import {
  AddTextFormData,
  TextChunkMap,
  TextIndexEntry,
  TextProgress,
  TextSectionTree
} from "~/app/model";
import { storeEpubContent, storePlaintextContent } from "~/app/textProcessing";

export class TextStore {
  // XXX: mobx 4.3.0 _entries.entries()
  private _entries: ObservableMap<string, TextIndexEntry> = observable.map<string, TextIndexEntry>(
    undefined,
    { deep: false }
  );

  @computed
  public get allTextEntries(): TextIndexEntry[] {
    return Array.from(this._entries.values());
  }

  @computed
  public get isEmpty(): boolean {
    return this._entries.size === 0;
  }

  public async loadFromDisk(): Promise<any> {
    // if (await exists(TextStore.textsIndexPath)) {
    //   const loadedLibrary = JSON.parse((await readFile(TextStore.textsIndexPath)).toString());
    //   runInAction(() => this._entries.replace(loadedLibrary));
    // }
  }

  // TODO: Cleanup
  @action
  public async add(
    formData: AddTextFormData,
    filePlaintext: string | undefined,
    fileBuffer: Buffer | undefined
  ): Promise<void> {
    const id = "4"; // Totally random id
    // const userDataPath = getUserDataPath();
    // const textsDirName = "texts";
    // const textsPath = path.join(userDataPath, textsDirName);
    // await ensurePathExists(textsPath);
    // const newTextPath = path.join(textsPath, id);
    // await ensurePathExists(newTextPath);

    let coverPath: string | undefined;
    let chunkMap: TextChunkMap;
    let sectionTree: TextSectionTree | undefined;
    if (formData.pastedText || filePlaintext) {
      chunkMap = await storePlaintextContent(
        ":-DDD",
        formData.pastedText || filePlaintext!,
        formData.contentLanguage
      );
    } else {
      [coverPath, chunkMap, sectionTree] = await storeEpubContent(
        ":-DDD",
        fileBuffer!,
        formData.contentLanguage
      );
    }

    // const indexFileName = "index.json";
    // const indexFilePath = path.join(newTextPath, indexFileName);
    // const indexContent = {
    //   chunkMap,
    //   sectionTree
    // };
    // await writeFile<string>(indexFilePath, JSON.stringify(indexContent));
    const newTextIndexEntry = {
      id,
      title: formData.title,
      author: formData.author,
      contentLanguage: formData.contentLanguage.code6393,
      translationLanguage: formData.translationLanguage.code6393,
      coverPath: coverPath ? ":-DDD" : undefined
    };
    runInAction(() => this._entries.set(id, newTextIndexEntry));
    this.syncToDisk();
  }

  @action
  public deleteById(id: string): void {
    this._entries.delete(id);
    this.syncToDisk();
    // deleteFile(path.join(TextStore.textsDirPath, id));
  }

  public async setTextProgress(_id: number, _progress: TextProgress): Promise<void> {
    console.log("to be removed");
  }

  private syncToDisk(): void {
    // writeFile<string>(TextStore.textsIndexPath, JSON.stringify(this._entries.toJSON()));
  }
}

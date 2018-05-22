import * as crypto from "crypto";
import { action, computed, observable, ObservableMap, runInAction, toJS } from "mobx";
import * as path from "path";

import {
  deleteFile,
  ensurePathExists,
  exists,
  getUserDataPath,
  readFile,
  writeFile
} from "~/util/fileUtils";

import {
  AddTextFormData,
  TextChunkMap,
  TextIndexEntry,
  TextProgress,
  TextSectionTree
} from "~/app/model";
import { storeEpubContent, storePlaintextContent } from "~/app/textProcessing";

export class TextStore {
  private static readonly textsIndexPath = path.join(getUserDataPath(), "library.json");
  private static readonly textsDirPath = path.join(getUserDataPath(), "texts");

  public texts: ObservableMap<string, TextIndexEntry> = observable.map<string, TextIndexEntry>(
    undefined,
    { deep: false }
  );

  @computed
  public get isEmpty(): boolean {
    return this.texts.size === 0;
  }

  public async loadFromDisk(): Promise<any> {
    if (await exists(TextStore.textsIndexPath)) {
      const loadedLibrary = JSON.parse((await readFile(TextStore.textsIndexPath)).toString());
      runInAction(() => this.texts.replace(loadedLibrary));
    }
  }

  // TODO: Cleanup
  @action
  public async add(
    formData: AddTextFormData,
    filePlaintext: string | undefined,
    fileBuffer: Buffer | undefined
  ): Promise<void> {
    const id = crypto.randomBytes(16).toString("hex");
    const userDataPath = getUserDataPath();
    const textsDirName = "texts";
    const textsPath = path.join(userDataPath, textsDirName);
    await ensurePathExists(textsPath);
    const newTextPath = path.join(textsPath, id);
    await ensurePathExists(newTextPath);

    let coverPath: string | undefined;
    let chunkMap: TextChunkMap;
    let sectionTree: TextSectionTree | undefined;
    if (formData.pastedText || filePlaintext) {
      chunkMap = await storePlaintextContent(
        newTextPath,
        formData.pastedText || filePlaintext!,
        formData.contentLanguage
      );
    } else {
      [coverPath, chunkMap, sectionTree] = await storeEpubContent(
        newTextPath,
        fileBuffer!,
        formData.contentLanguage
      );
    }

    const indexFileName = "index.json";
    const indexFilePath = path.join(newTextPath, indexFileName);
    const indexContent = {
      chunkMap,
      sectionTree
    };
    await writeFile<string>(indexFilePath, JSON.stringify(indexContent));
    const newTextIndexEntry = {
      id,
      title: formData.title,
      author: formData.author,
      contentLanguage: formData.contentLanguage.code6393,
      translationLanguage: formData.translationLanguage.code6393,
      coverPath: coverPath ? path.join(`texts/${id}`, coverPath) : undefined
    };
    runInAction(() => this.texts.set(id, newTextIndexEntry));
    this.syncToDisk();
  }

  @action
  public deleteById(id: string): void {
    this.texts.delete(id);
    this.syncToDisk();
    deleteFile(path.join(TextStore.textsDirPath, id));
  }

  public async setTextProgress(_id: number, _progress: TextProgress): Promise<void> {
    console.log("to be removed");
  }

  private syncToDisk(): void {
    writeFile<string>(TextStore.textsIndexPath, JSON.stringify(this.texts.toJSON()));
  }
}

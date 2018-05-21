import * as crypto from "crypto";
import { remote } from "electron";
import * as iconv from "iconv-lite";
import jschardet = require("jschardet");
import { debounce } from "lodash";
import { action, computed, observable, reaction, runInAction } from "mobx";
import { IPromiseBasedObservable } from "mobx-utils";
import * as path from "path";

import { isUtf8 } from "~/vendor/is-utf8";

import { Language } from "~/app/model";
import { SettingsStore, TextStore } from "~/app/stores";
import { metadataFromEpub, storeEpubContent, storePlaintextContent } from "~/app/textProcessing";
import {
  ensurePathExists,
  fileSize,
  getUserDataPath,
  isBufferText,
  readFile,
  writeStringToFile
} from "~/util/fileUtils";
import { languageFromCode6393, languageFromCodeGt } from "~/util/languageUtils";
import { detectLanguage } from "~/util/textUtils";

import { AddTextFormData, TextFileMetadata, TextFileStatus } from "~/library/model";

export class AddTextDialogStore {
  private static readonly defaultContentLanguage = languageFromCode6393("fra")!;
  private static readonly defaultTranslationLanguage = languageFromCode6393("eng")!;
  private static readonly languageDetectionSampleLength = 5000;
  private static readonly pastedTextLanguageDetectionDelayMs = 1000;

  @observable
  public formData: AddTextFormData = {
    filePath: "",
    pastedText: "",
    title: "",
    author: "",
    contentLanguage: AddTextDialogStore.defaultContentLanguage,
    translationLanguage: AddTextDialogStore.defaultTranslationLanguage
  };
  @observable public isPickingFile: boolean = false;
  @observable public isSavingText: boolean = false;

  @observable private fileMetadata?: TextFileMetadata;
  @observable private detectedLanguage?: Language;
  @observable private fileBuffer?: Buffer;
  @observable private isProcessingFile: boolean = false;

  public tatoebaTranslationCount?: IPromiseBasedObservable<number>;

  private filePlaintext?: string;

  // TODO: Dispose of reactions when AddTextDialog unmounts and recreate them when it mounts again?
  public constructor(private settingsStore: SettingsStore, private textStore: TextStore) {
    this.clearForm();
    reaction(() => this.detectedLanguage, language => this.handleDetectedLanguageChange(language));
    reaction(() => this.fileMetadata, metadata => this.handleTextFileMetadataChange(metadata));
    reaction(() => this.formData.filePath, filePath => this.handleSelectedFilePathChange(filePath));
  }

  @computed
  public get fileStatus(): TextFileStatus {
    if (this.isProcessingFile) {
      return "Processing";
    } else if (!this.fileBuffer) {
      return "NotSelected";
    } else if (!this.fileMetadata) {
      return "Invalid";
    } else {
      return "Valid";
    }
  }

  @computed
  public get isLanguageConfigurationValid(): boolean {
    return this.formData.contentLanguage !== this.formData.translationLanguage;
  }

  @action
  public async saveText(formData: AddTextFormData): Promise<void> {
    this.isSavingText = true;

    const id = crypto.randomBytes(16).toString("hex");
    const userDataPath = getUserDataPath();
    const textsDirName = "texts";
    const textsPath = path.join(userDataPath, textsDirName);
    await ensurePathExists(textsPath);
    const newTextPath = path.join(textsPath, id);
    await ensurePathExists(newTextPath);

    let coverPath;
    let chunkMap;
    let sectionTree;
    if (this.formData.pastedText || this.filePlaintext) {
      chunkMap = await storePlaintextContent(
        newTextPath,
        this.formData.pastedText || this.filePlaintext!,
        formData.contentLanguage
      );
    } else {
      [coverPath, chunkMap, sectionTree] = await storeEpubContent(
        newTextPath,
        this.fileBuffer!,
        formData.contentLanguage
      );
    }

    const indexFileName = "index.json";
    const indexFilePath = path.join(newTextPath, indexFileName);
    const indexContent = {
      chunkMap,
      sectionTree
    };
    await writeStringToFile(indexFilePath, JSON.stringify(indexContent));
    this.textStore.addToLibrary({
      id,
      title: formData.title,
      author: formData.author,
      contentLanguage: formData.contentLanguage.code6393,
      translationLanguage: formData.translationLanguage.code6393,
      coverPath: coverPath ? path.join(`texts/${id}`, coverPath) : undefined
    });
    this.clearForm();
    runInAction(() => (this.isSavingText = false));
  }

  // TODO: Cleanup
  @action
  public async processFile(filePath: string): Promise<void> {
    this.isProcessingFile = true;
    try {
      const fileBuffer = await readFile(filePath);
      runInAction(() => (this.fileBuffer = fileBuffer));
      if (this.fileBuffer) {
        const fileMetadata = await metadataFromEpub(this.fileBuffer);
        runInAction(() => (this.fileMetadata = fileMetadata));
      }
      this.isProcessingFile = false;
      return;
    } catch (_) {
      // skip
    }
    const isFilePlaintext = this.fileBuffer
      ? await isBufferText(this.fileBuffer, await fileSize(filePath))
      : false;
    if (this.fileBuffer && isFilePlaintext) {
      this.filePlaintext = isUtf8(this.fileBuffer)
        ? this.fileBuffer.toString()
        : iconv.decode(this.fileBuffer, jschardet.detect(this.fileBuffer).encoding).toString();
      runInAction(() => (this.fileMetadata = {}));
    }
    runInAction(() => (this.isProcessingFile = false));
    return;
  }

  @action
  private updateFormData(slice: Partial<AddTextFormData>): void {
    Object.assign(this.formData, slice);
  }

  private clearForm(): void {
    this.updateFormData({
      filePath: "",
      pastedText: "",
      title: "",
      author: "",
      contentLanguage: AddTextDialogStore.defaultContentLanguage,
      translationLanguage:
        languageFromCode6393(this.settingsStore.settings.defaultTranslationLanguage) ||
        AddTextDialogStore.defaultTranslationLanguage
    });
    this.discardText();
  }

  @action
  private discardText(): void {
    this.detectedLanguage = undefined;
    this.fileBuffer = undefined;
    this.fileMetadata = undefined;
    this.filePlaintext = undefined;
    this.isProcessingFile = false;
  }

  private detectPastedTextLanguage = debounce(
    action((pastedText: string) => {
      this.detectedLanguage = pastedText
        ? detectLanguage(pastedText.substr(0, AddTextDialogStore.languageDetectionSampleLength))
        : undefined;
    }),
    AddTextDialogStore.pastedTextLanguageDetectionDelayMs
  );

  @action
  public handlePastedTextChange = (pastedText: string) => {
    if (!pastedText) {
      this.clearForm();
    } else {
      this.updateFormData({ pastedText });
      this.detectPastedTextLanguage(pastedText);
    }
  };

  public handleClearPasteTextAreaButtonClick = () => {
    this.clearForm();
  };

  public handleDiscardSelectedFileButtonClick = () => {
    this.updateFormData({ filePath: "" });
  };

  public handleTitleChange = (title: string) => {
    this.updateFormData({ title });
  };

  public handleAuthorChange = (author: string) => {
    this.updateFormData({ author });
  };

  public handleContentLanguageChange = (languageCode6393: string) => {
    this.updateFormData({ contentLanguage: languageFromCode6393(languageCode6393) });
  };

  public handleTranslationLanguageChange = (languageCode6393: string) => {
    this.updateFormData({ translationLanguage: languageFromCode6393(languageCode6393) });
  };

  public handleLoadFileButtonClick = action(() => {
    this.isPickingFile = true;
    remote.dialog.showOpenDialog(
      {
        properties: ["openFile"]
      },
      action(filePaths => {
        this.isPickingFile = false;
        if (!filePaths) {
          return;
        }
        const filePath = filePaths.toString();
        this.updateFormData({
          title: path.basename(filePath, path.extname(filePath)),
          filePath
        });
      })
    );
  });

  public handleAddTextButtonClick = () => {
    this.saveText(this.formData);
    this.settingsStore.set({
      defaultTranslationLanguage: this.formData.translationLanguage
    });
  };

  private handleSelectedFilePathChange = (filePath: string) => {
    if (filePath) {
      this.processFile(filePath);
    } else {
      this.discardText();
    }
  };

  private handleTextFileMetadataChange = (metadata?: TextFileMetadata) => {
    if (!metadata) {
      return;
    }
    this.updateFormData({
      author: metadata.author || this.formData.author,
      title: metadata.title || this.formData.title
    });

    if (metadata.language) {
      this.detectedLanguage = languageFromCodeGt(metadata.language.substr(0, 2));
    } else if (this.filePlaintext) {
      this.detectedLanguage = detectLanguage(
        this.filePlaintext.substr(0, AddTextDialogStore.languageDetectionSampleLength)
      );
    }
  };

  private handleDetectedLanguageChange = (lang?: Language) => {
    this.formData.contentLanguage = lang ? lang : AddTextDialogStore.defaultContentLanguage;
  };
}

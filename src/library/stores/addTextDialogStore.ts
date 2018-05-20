import * as crypto from "crypto";
import { remote } from "electron";
import * as iconv from "iconv-lite";
import jschardet = require("jschardet");
import { action, autorun, computed, observable, reaction } from "mobx";
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
import { flowed } from "~/util/mobxUtils";
import { detectLanguage } from "~/util/textUtils";

import { AddTextFormData, TextFileMetadata, TextFileStatus } from "~/library/model";

export class AddTextDialogStore {
  private static readonly defaultContentLanguage = languageFromCode6393("fra")!;
  private static readonly defaultTranslationLanguage = languageFromCode6393("eng")!;
  private static readonly languageDetectionSampleLength = 5000;

  @observable public detectedTextLanguage?: Language;
  @observable public fileMetadata?: TextFileMetadata;
  @observable public isLanguageConfigurationValid: boolean = true;
  @observable public isSavingText: boolean = false;

  public tatoebaTranslationCount?: IPromiseBasedObservable<number>;

  @observable private fileBuffer?: Buffer;
  @observable private isProcessingFile: boolean = false;
  @observable private pastedText?: string;

  private filePlaintext?: string;

  // #region Moved stuff
  // TODO: Re-add delay for pasted text processing

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

  @action
  private updateFormData(slice: any): void {
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
  private setPickingFile(value: boolean): void {
    this.isPickingFile = value;
  }

  public handlePastedTextChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const pastedText = e.currentTarget.value;
    if (!pastedText) {
      this.clearForm();
    } else {
      this.updateFormData({ pastedText });
      this.setPastedText(pastedText); // XXX: Probably won't be needed anymore
      this.detectedTextLanguage =
        pastedText && pastedText !== ""
          ? detectLanguage(pastedText.substr(0, AddTextDialogStore.languageDetectionSampleLength))
          : undefined;
    }
  };

  public handleTitleChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.updateFormData({ title: e.currentTarget.value });
  };

  public handleAuthorChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.updateFormData({ author: e.currentTarget.value });
  };

  public handleContentLanguageChange = (e: any) => {
    this.updateFormData({ contentLanguage: languageFromCode6393(e.target.value) });
  };

  public handleTranslationLanguageChange = (e: any) => {
    this.updateFormData({ translationLanguage: languageFromCode6393(e.target.value) });
  };

  public handleLoadFileButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.setPickingFile(true);
    remote.dialog.showOpenDialog(
      {
        properties: ["openFile"]
      },
      filePaths => {
        this.setPickingFile(false);
        if (!filePaths) {
          return;
        }
        const filePath = filePaths.toString();
        this.updateFormData({
          title: path.basename(filePath, path.extname(filePath)),
          filePath
        });
      }
    );
  };

  public handleDiscardSelectedFileButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.clearForm();
  };

  public handleClearPasteTextAreaButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.clearForm();
  };

  public handleAddTextButtonClick = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await this.saveText(this.formData);
    this.settingsStore.set({
      defaultTranslationLanguage: this.formData.translationLanguage
    });
    this.clearForm();
  };

  private handleTextFileMetadataChange(metadata?: TextFileMetadata): void {
    if (!metadata) {
      return;
    }
    const { author, title } = metadata;
    if (author) {
      this.updateFormData({ author });
    }
    if (title) {
      this.updateFormData({ title });
    }

    if (metadata && metadata.language) {
      this.detectedTextLanguage = languageFromCodeGt(metadata.language.substr(0, 2));
    } else if (this.filePlaintext) {
      this.detectedTextLanguage = detectLanguage(
        this.filePlaintext.substr(0, AddTextDialogStore.languageDetectionSampleLength)
      );
    }
  }

  private handleDetectedTextLanguageChange = (lang?: Language): void => {
    this.formData.contentLanguage = lang ? lang : AddTextDialogStore.defaultContentLanguage;
  };

  // #endregion

  // TODO: Disposers?
  public constructor(private settingsStore: SettingsStore, private textStore: TextStore) {
    // reaction(() => this.pastedText, text => this.handlePastedTextChange(text), { delay: 1000 });
    // reaction(() => this.fileMetadata, metadata => this.handleTextFileMetadataChange(metadata));

    this.clearForm();
    reaction(
      () => this.detectedTextLanguage,
      language => this.handleDetectedTextLanguageChange(language)
    );
    reaction(() => this.fileMetadata, metadata => this.handleTextFileMetadataChange(metadata));
    reaction(() => this.formData.filePath, filePath => this.handleSelectedFilePathChange(filePath));
    autorun(() => {
      this.handleSelectedLanguagesChange([
        this.formData.contentLanguage,
        this.formData.translationLanguage
      ]);
    });
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

  @flowed
  public *saveText(formData: AddTextFormData): IterableIterator<Promise<any>> {
    this.isSavingText = true;

    const id = crypto.randomBytes(16).toString("hex");
    const userDataPath = getUserDataPath();
    const textsDirName = "texts";
    const textsPath = path.join(userDataPath, textsDirName);
    yield ensurePathExists(textsPath);
    const newTextPath = path.join(textsPath, id);
    yield ensurePathExists(newTextPath);

    let coverPath;
    let chunkMap;
    let sectionTree;
    if (this.pastedText || this.filePlaintext) {
      chunkMap = yield storePlaintextContent(
        newTextPath,
        this.pastedText || this.filePlaintext!,
        formData.contentLanguage
      );
    } else {
      [coverPath, chunkMap, sectionTree] = yield storeEpubContent(
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
    yield writeStringToFile(indexFilePath, JSON.stringify(indexContent));
    this.textStore.addToLibrary({
      id,
      title: formData.title,
      author: formData.author,
      contentLanguage: formData.contentLanguage.code6393,
      translationLanguage: formData.translationLanguage.code6393,
      coverPath: coverPath ? path.join(`texts/${id}`, coverPath) : undefined
    });
    this.discardText();
    this.isSavingText = false;
  }

  // TODO: Cleanup
  @flowed
  public *processFile(filePath: string): IterableIterator<Promise<any>> {
    this.isProcessingFile = true;
    try {
      this.fileBuffer = yield readFile(filePath);
      if (this.fileBuffer) {
        this.fileMetadata = yield metadataFromEpub(this.fileBuffer);
      }
      this.isProcessingFile = false;
      return;
    } catch (_) {
      // skip
    }
    const isFilePlaintext = this.fileBuffer
      ? yield isBufferText(this.fileBuffer, yield fileSize(filePath))
      : false;
    if (this.fileBuffer && isFilePlaintext) {
      this.filePlaintext = isUtf8(this.fileBuffer)
        ? this.fileBuffer.toString()
        : iconv.decode(this.fileBuffer, jschardet.detect(this.fileBuffer).encoding).toString();
      this.fileMetadata = {};
    }
    this.isProcessingFile = false;
    return;
  }

  @action
  public handleSelectedLanguagesChange([contentLanguage, translationLanguage]: [
    Language,
    Language
  ]): void {
    this.isLanguageConfigurationValid = contentLanguage.code6393 !== translationLanguage.code6393;
    // this.tatoebaTranslationCount = this.isLanguageConfigurationValid
    //   ? fromPromise(getSentenceCount(contentLanguage, translationLanguage))
    //   : undefined
  }

  @action
  public discardText(): void {
    this.detectedTextLanguage = undefined;
    this.fileBuffer = undefined;
    this.fileMetadata = undefined;
    this.filePlaintext = undefined;
    this.isProcessingFile = false;
    this.pastedText = undefined;
  }

  @action
  public setPastedText(value?: string): void {
    this.pastedText = value;
  }

  public handleSelectedFilePathChange(filePath: string): void {
    if (filePath) {
      this.processFile(filePath);
    } else {
      this.discardText();
    }
  }
}

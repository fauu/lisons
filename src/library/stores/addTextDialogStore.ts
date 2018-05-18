import * as crypto from "crypto";
import * as iconv from "iconv-lite";
import jschardet = require("jschardet");
import { action, computed, observable, reaction } from "mobx";
import { IPromiseBasedObservable } from "mobx-utils";
import * as path from "path";

import { Language } from "~/app/model";
import { metadataFromEpub, storeEpubContent, storePlaintextContent } from "~/app/textProcessing";

import {
  ensurePathExists,
  fileSize,
  getUserDataPath,
  isBufferText,
  readFile,
  writeStringToFile
} from "~/util/fileUtils";
import { languageFromCodeGt } from "~/util/languageUtils";
import { flowed } from "~/util/mobxUtils";
import { detectLanguage } from "~/util/textUtils";

import { isUtf8 } from "~/vendor/is-utf8";

import { AddTextFormData, TextFileMetadata, TextFileStatus } from "~/library/model";

export class AddTextDialogStore {
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

  public constructor() {
    reaction(() => this.pastedText, text => this.handlePastedTextChange(text), { delay: 1000 });
    reaction(() => this.fileMetadata, metadata => this.handleTextFileMetadataChange(metadata));
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

    let chunkMap;
    let sectionTree;
    if (this.pastedText || this.filePlaintext) {
      chunkMap = yield storePlaintextContent(
        newTextPath,
        this.pastedText || this.filePlaintext!,
        formData.contentLanguage
      );
    } else {
      [chunkMap, sectionTree] = yield storeEpubContent(
        newTextPath,
        this.fileBuffer!,
        formData.contentLanguage
      );
    }

    const indexFileName = "index.json";
    const indexFilePath = path.join(newTextPath, indexFileName);
    const indexContent = {
      title: formData.title,
      author: formData.author,
      contentLanguage: formData.contentLanguage.code6393,
      translationLanguage: formData.translationLanguage.code6393,
      chunkMap,
      sectionTree
    };
    yield writeStringToFile(indexFilePath, JSON.stringify(indexContent));
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

  private handlePastedTextChange = (content?: string): void => {
    this.detectedTextLanguage =
      content && content !== ""
        ? detectLanguage(content.substr(0, AddTextDialogStore.languageDetectionSampleLength))
        : undefined;
  };

  private handleTextFileMetadataChange(metadata: TextFileMetadata | undefined): void {
    if (metadata && metadata.language) {
      this.detectedTextLanguage = languageFromCodeGt(metadata.language.substr(0, 2));
    } else if (this.filePlaintext) {
      this.detectedTextLanguage = detectLanguage(
        this.filePlaintext.substr(0, AddTextDialogStore.languageDetectionSampleLength)
      );
    }
  }
}

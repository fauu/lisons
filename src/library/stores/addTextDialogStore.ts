import * as crypto from "crypto";
import * as iconv from "iconv-lite";
import jschardet = require("jschardet");
import { action, computed, observable, reaction } from "mobx";
import { IPromiseBasedObservable } from "mobx-utils";
import * as path from "path";

import { convertEpubToLisonsText, loadMetadata } from "~/app/epub";
import { Language } from "~/app/model";

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
  @observable public isLanguageConfigurationValid: boolean = true;
  @observable public isSavingText: boolean = false;
  @observable public textFileMetadata?: TextFileMetadata;

  public tatoebaTranslationCount?: IPromiseBasedObservable<number>;

  @observable private isProcessingTextFile: boolean = false;
  @observable private pastedText?: string;
  @observable private textFileBuffer?: Buffer;

  private textFilePlaintext?: string;

  public constructor() {
    reaction(() => this.pastedText, text => this.handlePastedTextChange(text), { delay: 1000 });
    reaction(() => this.textFileMetadata, metadata => this.handleTextFileMetadataChange(metadata));
  }

  @computed
  public get textFileStatus(): TextFileStatus {
    if (this.isProcessingTextFile) {
      return "Processing";
    } else if (!this.textFileBuffer) {
      return "NotSelected";
    } else if (!this.textFileMetadata) {
      return "Invalid";
    } else {
      return "Valid";
    }
  }

  @flowed
  public *saveText(formData: AddTextFormData): IterableIterator<Promise<any>> {
    this.isSavingText = true;

    console.log("saveText()", {
      title: formData.title,
      author: formData.author,
      contentLanguage: formData.contentLanguage,
      translationLanguage: formData.translationLanguage,
      pastedContent: this.pastedText,
      textFileBuffer: this.textFileBuffer,
      textFilePlaintext: this.textFilePlaintext
    });
    const id = crypto.randomBytes(16).toString("hex");
    const userDataPath = getUserDataPath();
    const textsDirName = "texts";
    const textsPath = path.join(userDataPath, textsDirName);
    yield ensurePathExists(textsPath);
    const newTextPath = path.join(textsPath, id);
    yield ensurePathExists(newTextPath);

    const [textChunkMap, textSectionTree] = yield convertEpubToLisonsText(
      newTextPath,
      this.textFileBuffer!,
      formData.contentLanguage
    );

    const indexFileName = "index.json";
    const indexFilePath = path.join(newTextPath, indexFileName);
    const indexContent = {
      title: formData.title,
      author: formData.author,
      contentLanguage: formData.contentLanguage.code6393,
      translationLanguage: formData.translationLanguage.code6393,
      chunkMap: textChunkMap,
      sectionTree: textSectionTree
    };
    yield writeStringToFile(indexFilePath, JSON.stringify(indexContent));
    this.discardText();
    this.isSavingText = false;
  }

  // TODO: Cleanup
  @flowed
  public *processFile(filePath: string): IterableIterator<Promise<any>> {
    this.isProcessingTextFile = true;
    try {
      this.textFileBuffer = yield readFile(filePath);
      if (this.textFileBuffer) {
        this.textFileMetadata = yield loadMetadata(this.textFileBuffer);
      }
      this.isProcessingTextFile = false;
      return;
    } catch (_) {
      // skip
    }
    const isFilePlaintext = this.textFileBuffer
      ? yield isBufferText(this.textFileBuffer, yield fileSize(filePath))
      : false;
    if (this.textFileBuffer && isFilePlaintext) {
      this.textFilePlaintext = isUtf8(this.textFileBuffer)
        ? this.textFileBuffer.toString()
        : iconv
            .decode(this.textFileBuffer, jschardet.detect(this.textFileBuffer).encoding)
            .toString();
      this.textFileMetadata = {};
    }
    this.isProcessingTextFile = false;
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
    this.isProcessingTextFile = false;
    this.pastedText = undefined;
    this.textFileBuffer = undefined;
    this.textFileMetadata = undefined;
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
    } else if (this.textFilePlaintext) {
      this.detectedTextLanguage = detectLanguage(
        this.textFilePlaintext.substr(0, AddTextDialogStore.languageDetectionSampleLength)
      );
    }
  }
}

import { zip } from "lodash";

import { languageFromCode6393 } from "~/util/languageUtils";
import { firstNWords } from "~/util/stringUtils";

import { Database } from "~/app/database";
import {
  Language,
  ParsedText,
  Text,
  TextInfo,
  TextProgress,
  TextSectionInfo,
  TokenizedTextContent
} from "~/app/model";
import { tokenize } from "~/app/tokenization/";

export class TextRepository {
  public constructor(private db: Database) {}

  public async save(text: TextInfo, parsedText: ParsedText): Promise<Text> {
    if (!text.title) {
      text.title = firstNWords(parsedText.sample, 5, 60, true);
    }

    const [structure, tokenizedContent] = await this.processContent(
      parsedText,
      languageFromCode6393(text.contentLanguage)!
    );
    console.log(structure);

    return this.db.transaction("rw", this.db.texts, this.db.textContents, async () => {
      const textId = await this.db.texts.put(text);
      await this.db.textContents.put({
        textId,
        elementCount: tokenizedContent.types.length,
        elementTypes: tokenizedContent.types,
        elementValues: tokenizedContent.values,
        structure
      });
      const newRecord = this.db.texts
        .where("id")
        .equals(textId)
        .first();
      return Text.fromPersisted((await newRecord)!);
    });
  }

  public async loadAll(): Promise<Text[]> {
    const persistedTexts = await this.db.texts.toArray();
    return persistedTexts.map(t => Text.fromPersisted(t));
  }

  public async loadOneWithContent(id: number): Promise<Text | undefined> {
    const persistedText = await this.db.texts
      .where("id")
      .equals(id)
      .first();
    if (!persistedText) {
      return Promise.resolve(undefined);
    }
    const text = Text.fromPersisted(persistedText);
    const persistedContent = await this.db.textContents
      .where("textId")
      .equals(id)
      .first();
    if (!persistedContent) {
      return Promise.resolve(undefined);
    }
    text.tokenizedContent = {
      types: persistedContent.elementTypes,
      values: persistedContent.elementValues,
      startNo: 0
    };
    text.structure = persistedContent.structure;
    return text;
  }

  public updateProgress(id: number, progress: TextProgress): Promise<Text> {
    return this.db.transaction("rw", this.db.texts, async () => {
      await this.db.texts.update(id, {
        progressElementNo: progress.elementNo,
        progressPercentage: progress.percentage
      });
      const updatedRecord = this.db.texts
        .where("id")
        .equals(id)
        .first();
      return Text.fromPersisted((await updatedRecord)!);
    });
  }

  public async delete(id: number): Promise<void> {
    Promise.all([
      this.db.texts
        .where("id")
        .equals(id)
        .delete(),
      this.db.textContents
        .where("textId")
        .equals(id)
        .delete()
    ]);
  }

  private async processContent(
    parsedText: ParsedText,
    language: Language
  ): Promise<[TextSectionInfo[] | undefined, TokenizedTextContent]> {
    const [tokenizedContent, sectionStartElementNos] = await tokenize(parsedText.content, language);
    if (parsedText.sectionNames) {
      if (parsedText.sectionNames.length !== sectionStartElementNos.length) {
        console.warn("'sectionNames' and 'sectionStartIndices' length mismatch");
      } else {
        const textSectionInfos = zip(parsedText.sectionNames, sectionStartElementNos).map(
          ([name, startElementNo]) => ({
            name,
            startElementNo
          })
        );
        return [textSectionInfos as TextSectionInfo[], tokenizedContent];
      }
    }
    return [undefined, tokenizedContent];
  }
}

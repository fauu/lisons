import Dexie from "dexie"

import { ITextContent, ITextInfo } from "~/app/model"

export class Database extends Dexie {
  public texts: Dexie.Table<ITextInfo, number>
  public textContents: Dexie.Table<ITextContent, number>

  public constructor() {
    super("Database")
    this.version(1).stores({
      texts:
        "++id, title, author, progressElementNo, progressPercentage, contentLanguage, translationLanguage",
      textContents: "++id, textId, elementCount, elementTypes, elementValues, structure"
    })
  }
}

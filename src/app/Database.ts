import Dexie from "dexie"

import { TextContent, TextInfo } from "~/app/model"

export class Database extends Dexie {
  public texts!: Dexie.Table<TextInfo, number>
  public textContents!: Dexie.Table<TextContent, number>

  public constructor() {
    super("Database")
    this.version(1).stores({
      texts:
        "++id, title, author, progressElementNo, progressPercentage, contentLanguage, translationLanguage",
      textContents: "++id, textId, elementCount, elementTypes, elementValues, structure"
    })
  }
}

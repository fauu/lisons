import * as crypto from "crypto"
import * as path from "path"

import { IAddTextFormData } from "~/library/model"
import { ensurePathExists, getUserDataPath, writeStringToFile } from "~/util/FileUtils"

const ctx: Worker = self as any

ctx.onmessage = async ev => {
  const { formData, pastedText, textFileBuffer, textFilePlaintext } = ev.data as IAddTextFormData
  console.log("saveText()", {
    title: formData.title,
    author: formData.author,
    contentLanguage: formData.contentLanguage,
    translationLanguage: formData.translationLanguage,
    pastedContent: pastedText,
    textFileBuffer,
    textFilePlaintext
  })
  const id = crypto.randomBytes(16).toString("hex")
  console.log(id)
  const userDataPath = getUserDataPath()
  const textsDirName = "texts"
  const textsPath = path.join(userDataPath, textsDirName)
  await ensurePathExists(textsPath)
  const newTextPath = path.join(textsPath, id)
  await ensurePathExists(newTextPath)
  const indexFileName = "index.json"
  const indexFilePath = path.join(newTextPath, indexFileName)
  const indexContent = {
    title: formData.title,
    author: formData.author,
    contentLanguage: formData.contentLanguage.code6393,
    translationLanguage: formData.translationLanguage.code6393
  }
  await writeStringToFile(indexFilePath, JSON.stringify(indexContent))

  ctx.postMessage("DONE")
}

import * as franc from "franc-min"
import * as iconv from "iconv-lite"

import { epubFromBuffer, IEpub } from "~/vendor/epub-parser"
import { isUtf8 } from "~/vendor/is-utf8"

import jschardet = require("jschardet")

import { fileSize, isText, readFile } from "~/util/FileUtils"

export const isEpub = (maybeEpub: any): boolean =>
  maybeEpub && maybeEpub.hasOwnProperty("markedContent")

export const detectLanguage = (input: string): string | undefined => {
  const lang = franc(input)
  return lang !== "und" ? lang : undefined
}

export const getEpubOrPlainContent = async (path: string): Promise<IEpub | string> => {
  let data: Buffer | undefined
  try {
    data = await readFile(path)
    const epub = await epubFromBuffer(data!)
    return epub || ""
  } catch (e) {
    const isDataText = data && (await isText(data, await fileSize(path)))
    if (data && isDataText) {
      if (!isUtf8(data)) {
        return iconv.decode(data, jschardet.detect(data).encoding).toString()
      }
      return data.toString()
    } else {
      console.error("Error parsing file: ", e)
    }
  }
  return ""
}

export const takeSample = (rawTextContent: string, length: number) => {
  return rawTextContent.substr(0, length)
}

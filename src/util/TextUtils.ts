import parser from "@gxl/epub-parser"
import { Epub } from "@gxl/epub-parser/build/types/epubParser"
import * as franc from "franc-min"

import { IParsedText } from "~/app/model"
import { fileSize, isText, readFile } from "~/util/FileUtils"

export const isEpub = (maybeEpub: any): boolean => maybeEpub && maybeEpub.hasOwnProperty("info")

export const detectLanguage = (input: string): string | undefined => {
  const lang = franc(input)
  return lang !== "und" ? lang : undefined
}

const stripHtml = (input: string): string => {
  const tmp = document.createElement("div")
  tmp.innerHTML = input
  return tmp.textContent || tmp.innerText || ""
}

export const parseText = (epubOrPlainContent: Epub | string, sampleLength: number): IParsedText => {
  if (isEpub(epubOrPlainContent)) {
    const epub = epubOrPlainContent as Epub

    let sample = ""
    const sections = epub.sections.map(s => {
      const structureEntry = (epub.structure as any[]).find(el => el.sectionId === s.id)
      let name
      if (structureEntry) {
        name = structureEntry.name
      }
      const text = stripHtml(s.toMarkdown!())
      if (sample.length < sampleLength) {
        sample += text
      }
      return { id: s.id, name, content: text }
    })

    return { sections, sample: sample.substr(0, sampleLength) }
  }
  const content = epubOrPlainContent as string
  return { content, sample: content.substr(0, sampleLength) }
}

export const getEpubOrPlainContent = async (path: string): Promise<Epub | string> => {
  let data: Buffer | undefined
  try {
    data = await readFile(path)
    return await parser(data!, { type: "buffer" })
  } catch (e) {
    const isDataText = data && (await isText(data, await fileSize(path)))
    if (data && isDataText) {
      return data.toString()
    }
  }
  return ""
}

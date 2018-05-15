// TODO: Support TOC structure beyond depth of 1

import * as zip from "jszip"
import * as path from "path"

import { ITextFileMetadata } from "~/library/model"

import { punctuationLikeChars } from "~/app/data/PunctuationLikeChars"
import { ILanguage } from "~/app/model"
import { ensurePathExists, writeFile } from "~/util/FileUtils"
import { IEpub } from "~/vendor/epub-parser"

interface IOpfMetadata {
  title?: string
  creator?: string
  language?: string
}

interface IOpfManifest {
  items: IOpfItem[]
}

interface IOpfItem {
  id: string
  mediaType: string
  href: string
}

interface IOpfSpine {
  toc?: string
  itemRefs: IOpfItemRef[]
}

interface IOpfItemRef {
  idRef: string
}

interface IFileWithContent {
  path: string
  content: string
}

interface ITocEntry {
  label: string
  contentFilePath: string
  contentFragmentId?: string
}

export const loadMetadata = async (buffer: Buffer): Promise<ITextFileMetadata> => {
  const archive = await zip.loadAsync(buffer)

  const opfPath = await getOpfPath(archive)
  const opfFragment = await getOpfFragment(archive, opfPath)
  const opfMetadata = getOpfMetadata(opfFragment)
  console.log("OPF Metadata:", opfMetadata)

  return { author: opfMetadata.creator, title: opfMetadata.title, language: opfMetadata.language }
}

export type TextChunkMap = ITextChunkMapElement[]

interface ITextChunkMapElement {
  id: string
  href: string
  wordCount: number
  startWordNo: number
}

export const convertEpubToLisonsText = async (
  textPath: string,
  buffer: Buffer,
  contentLanguage: ILanguage
): Promise<TextChunkMap> => {
  const archive = await zip.loadAsync(buffer)

  const opfPath = await getOpfPath(archive)
  const opfFragment = await getOpfFragment(archive, opfPath)
  const opfManifest = getOpfManifest(opfFragment, [
    "application/xhtml+xml",
    "application/x-dtbncx+xml"
  ])
  const opfSpine = getOpfSpine(opfFragment)
  const itemsDir = path.dirname(opfPath)

  let toc = opfSpine.toc ? await getToc(archive, opfManifest, opfSpine.toc, itemsDir) : undefined
  if (toc && toc.length <= 1) {
    toc = undefined
  }

  const serializer = new XMLSerializer()
  const parser = new DOMParser()
  const wrapWordsInTags = getWrapWordsInTagsFn(contentLanguage)

  const textChunkMap: TextChunkMap = []

  for (const item of opfManifest.items) {
    const itemPath = path.join(textPath, item.href)
    await ensurePathExists(path.dirname(itemPath))
    const itemFile = archive.file(path.join(itemsDir, item.href))

    if (item.mediaType !== "application/xhtml+xml") {
      writeFile<Buffer>(itemPath, await itemFile.async("nodebuffer"))
    } else {
      let chunkWordCount = 0
      const itemHtmlContent = await itemFile.async("text")
      const itemHtmlDocument = parser.parseFromString(itemHtmlContent, "application/xml")

      itemHtmlDocument.head.innerHTML = "<meta charset='utf-8' />" + itemHtmlDocument.head.innerHTML

      const treeWalker = document.createTreeWalker(
        itemHtmlDocument.body,
        NodeFilter.SHOW_TEXT,
        { acceptNode: _ => NodeFilter.FILTER_ACCEPT },
        false
      )
      while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode
        if (!node.textContent || node.textContent.trim() === "") {
          continue
        }
        const [newTextContent, wordCount] = await wrapWordsInTags(node.textContent)
        node.textContent = newTextContent
        chunkWordCount += wordCount
      }

      let newItemHtmlContent = serializer.serializeToString(itemHtmlDocument)
      newItemHtmlContent = newItemHtmlContent.replace(/&gt;/g, ">")
      newItemHtmlContent = newItemHtmlContent.replace(/&lt;/g, "<")

      textChunkMap.push({
        id: item.id,
        href: item.href,
        wordCount: chunkWordCount,
        startWordNo: -1
      })
      writeFile<string>(itemPath, newItemHtmlContent)
    }
  }

  textChunkMap.sort(
    (a, b) =>
      opfSpine.itemRefs.findIndex(ref => ref.idRef === a.id) -
      opfSpine.itemRefs.findIndex(ref => ref.idRef === b.id)
  )

  let currentWordCount = 0
  textChunkMap.forEach(chunk => {
    chunk.startWordNo = currentWordCount
    currentWordCount += chunk.wordCount
  })

  return textChunkMap
}

const getWrapWordsInTagsFn = (contentLanguage: ILanguage) => {
  switch (contentLanguage.code6393) {
    case "jpn":
      return wrapWordsInTagsJpn
    case "cmn":
      return wrapWordsInTagsCn("simplified")
    case "lzh":
      return wrapWordsInTagsCn("traditional")
    default:
      return wrapWordsInTagsStd
  }
}

const wordRegexp = new RegExp(`([^${punctuationLikeChars}\r\n]+)`, "g")

const wrapWordsInTagsStd = (s: string): Promise<[string, number]> => {
  let wordCount = 0
  const sWithWordsWrapped = s.replace(wordRegexp, substring => {
    wordCount++
    return `<w>${substring}</w>`
  })
  return new Promise((resolve, _reject) => resolve([sWithWordsWrapped, wordCount]))
}

// tslint:disable-next-line:no-var-requires
const kuromoji = require("kuromoji")
let kuromojiInstance: any
const wrapWordsInTagsJpn = async (s: string): Promise<[string, number]> => {
  if (!kuromojiInstance) {
    kuromojiInstance = await new Promise((resolve, reject) => {
      kuromoji
        .builder({
          dicPath: ""
        })
        .build((err: any, tokenizer: any) => {
          if (err) {
            reject(err)
          }
          resolve(tokenizer)
        })
    })
  }
  return kuromojiInstance.tokenize(s).reduce(
    ([acc, wordCount]: [string, number], val: any) => {
      const element = val.surface_form
      const isAWord = wordRegexp.test(element)
      return isAWord ? [acc + `<w>${element}</w>`, wordCount + 1] : [acc + element, wordCount]
    },
    ["", 0]
  )
}

let chineseTokenizerInstance: any
const wrapWordsInTagsCn = (charactersType: string) => async (
  s: string
): Promise<[string, number]> => {
  if (!chineseTokenizerInstance) {
    chineseTokenizerInstance = require("chinese-tokenizer").loadFile("out/cedict_ts.u8")
  }
  return chineseTokenizerInstance(s).reduce(
    ([acc, wordCount]: [string, number], val: any) => {
      const element = val[charactersType]
      const isAWord = val.matches.length > 0
      return isAWord ? [acc + `<w>${element}</w>`, wordCount + 1] : [acc + element, wordCount]
    },
    ["", 0]
  )
}

export const epubFromBuffer = async (buffer: Buffer): Promise<IEpub | undefined> => {
  const archive = await zip.loadAsync(buffer)

  const opfPath = await getOpfPath(archive)
  const opfFragment = await getOpfFragment(archive, opfPath)
  const opfMetadata = getOpfMetadata(opfFragment)
  console.log("OPF Metadata:", opfMetadata)
  const opfManifest = getOpfManifest(opfFragment, [
    "application/xhtml+xml",
    "application/x-dtbncx+xml"
  ])
  console.log("OPF Manifest:", opfManifest)
  const opfSpine = getOpfSpine(opfFragment)
  console.log("OPF Spine:", opfSpine)
  const itemsDir = path.dirname(opfPath)
  console.log("Items directory:", itemsDir)

  let toc = opfSpine.toc ? await getToc(archive, opfManifest, opfSpine.toc, itemsDir) : undefined
  if (toc && toc.length <= 1) {
    toc = undefined
  }
  console.log("TOC:", toc)

  const filesWithContent = await getFilesWithContent(archive, opfManifest, opfSpine, itemsDir)
  const markedContent = stripHtml(await getRawMarkedContent(filesWithContent, toc))
  if (markedContent === "") {
    throw new Error("Parsed EPUB has no text content")
  }

  return {
    author: opfMetadata.creator,
    title: opfMetadata.title,
    sectionNames: toc ? toc.map(e => e.label) : undefined,
    markedContent
  }
}

const getOpfPath = async (archive: zip): Promise<string> => {
  const containerFile = archive.file("META-INF/container.xml")
  if (!containerFile) {
    throw new Error("'container.xml' not found")
  }
  const containerFileContent = await containerFile.async("text")
  const containerFragment = document.createRange().createContextualFragment(containerFileContent)
  const rootfileElement = containerFragment.querySelector("rootfile")
  if (!rootfileElement) {
    throw new Error("'rootfile' element not found")
  }
  const fullpathValue = rootfileElement.getAttribute("full-path")
  if (!fullpathValue) {
    throw new Error("'full-path' attribute not found")
  }
  return fullpathValue
}

const getOpfFragment = async (archive: zip, opfPath: string): Promise<DocumentFragment> => {
  const opfFile = archive.file(opfPath)
  if (opfFile === null) {
    throw new Error(`OPF file not found at '${opfPath}'`)
  }
  return document.createRange().createContextualFragment(await opfFile.async("text"))
}

const getOpfMetadata = (fragment: DocumentFragment): IOpfMetadata => {
  const opfMetadata = {}
  const fieldNames = ["title", "creator", "language"]
  fieldNames.forEach(fieldName => {
    const element = fragment.querySelector(`metadata > dc\\:${fieldName}`)
    if (element && element.textContent) {
      opfMetadata[fieldName] = element.textContent
    }
  })
  return opfMetadata
}

const getOpfManifest = (fragment: DocumentFragment, acceptedMediaTypes: string[]): IOpfManifest => {
  const items = Array.from(fragment.querySelectorAll("manifest item"))
    .map(itemElement => {
      const mediaType = itemElement.getAttribute("media-type") || ""
      const id = itemElement.getAttribute("id")
      if (acceptedMediaTypes.includes(mediaType) || id === "ncx") {
        const href = itemElement.getAttribute("href")
        return id !== null && href !== null ? { id, mediaType, href } : undefined
      }
      return undefined
    })
    .filter(item => item !== undefined)
  return { items: items as IOpfItem[] }
}

const getOpfSpine = (fragment: DocumentFragment): IOpfSpine => {
  const spineElement = fragment.querySelector("spine")
  if (!spineElement) {
    throw new Error("The OPF file is spineless")
  }
  let tocValue: string | null | undefined = spineElement.getAttribute("toc")
  if (!tocValue || tocValue === "") {
    tocValue = undefined
    console.warn("Spine has no toc reference")
  }

  const itemRefs = Array.from(fragment.querySelectorAll("spine itemref"))
    .map(itemRefElement => ({ idRef: itemRefElement.getAttribute("idref") }))
    .filter(itemRef => itemRef.idRef !== null)
  return {
    toc: tocValue,
    itemRefs: itemRefs as IOpfItemRef[]
  }
}

const getFilesWithContent = async (
  archive: zip,
  manifest: IOpfManifest,
  spine: IOpfSpine,
  itemsDir: string
): Promise<IFileWithContent[]> => {
  const arrayOfPromises = spine.itemRefs.map(async ({ idRef }) => {
    const item = manifest.items.find(_item => _item.id === idRef)
    if (!item) {
      console.warn(`Item with idRef '${idRef}' not present in the manifest`)
      return
    }
    const itemPath = path.join(itemsDir, item.href)
    const itemFile = archive.file(itemPath)
    if (!itemFile) {
      console.warn(`File for item with path '${itemPath}' not found`)
      return
    }
    return { path: itemPath, content: await itemFile.async("text") }
  })
  const promiseOfArrayWithUndefineds = await Promise.all(arrayOfPromises)
  return (await promiseOfArrayWithUndefineds.filter(el => el)) as IFileWithContent[]
}

// TODO: Break down
const getToc = async (
  archive: zip,
  manifest: IOpfManifest,
  tocId: string,
  itemsDir: string
): Promise<ITocEntry[] | undefined> => {
  const tocItem = manifest.items.find(item => item.id === tocId)
  if (!tocItem) {
    console.warn("Manifest has no TOC item despite the spine having TOC reference")
  } else {
    const tocPath = path.join(itemsDir, tocItem.href)
    const tocFile = archive.file(tocPath)
    if (!tocFile) {
      console.warn("Referenced TOC file not found")
    } else {
      const tocFileContent = await tocFile.async("text")
      const tocFragment = document.createRange().createContextualFragment(tocFileContent)
      const navMapElement = tocFragment.querySelector("navMap")
      if (!navMapElement) {
        console.warn("TOC has no 'navMap' element")
      } else {
        return Array.from(navMapElement.children)
          .map(navPointElement => {
            if (navPointElement.tagName.toLowerCase() !== "navpoint") {
              console.warn(
                `Expected just 'navPoint' elements inside 'navMap', got '${
                  navPointElement.tagName
                }'`
              )
              return
            }
            let label
            let contentSrc
            Array.from(navPointElement.children).forEach(child => {
              switch (child.tagName.toLowerCase()) {
                case "navlabel":
                  const textElement = child.firstElementChild
                  if (!textElement) {
                    console.warn("'navLabel' empty")
                    return
                  }
                  if (textElement.tagName.toLowerCase() !== "text") {
                    console.warn(
                      `Expected 'Text' element as a first child of 'navLabel', got ${
                        textElement.tagName
                      }`
                    )
                    return
                  }
                  label = textElement.textContent
                  break
                case "content":
                  contentSrc = child.getAttribute("src")
                  break
                case "navPoint":
                  // nested navPoint, do nothing
                  break
                default:
                  console.warn(
                    `Encountered unexpected '${child.tagName}' element inside 'navPoint'`
                  )
              }
            })
            if (!label || label === "") {
              console.warn("'navPoint' label empty")
              return
            }
            if (!contentSrc || contentSrc === "") {
              console.warn("'content' element 'src' attribute empty")
              contentSrc = ""
            }
            const [contentFilePath, contentFragmentId] = contentSrc.split("#")
            return {
              label,
              contentFilePath: path.join(itemsDir, contentFilePath),
              contentFragmentId
            }
          })
          .filter(el => el) as ITocEntry[]
      }
    }
  }
  return
}

// TODO: Break down
const getRawMarkedContent = async (
  filesWithContent: IFileWithContent[],
  toc?: ITocEntry[]
): Promise<string> => {
  return filesWithContent
    .map(file => {
      let fileContent = file.content
      if (toc) {
        const tocItems = toc.filter(item => item.contentFilePath === file.path)
        tocItems.forEach(tocItem => {
          const marker = " {####SECTIONSTART} "
          if (!tocItem.contentFragmentId) {
            fileContent = marker + fileContent
          } else {
            const fragmentIdStartIdx = fileContent.indexOf(tocItem.contentFragmentId)
            if (fragmentIdStartIdx === -1) {
              console.warn(
                `TOC entry fragment ID '${file.path}#${tocItem.contentFragmentId}' not found`
              )
              return
            }
            const tagClosingIdx = fileContent.indexOf(">", fragmentIdStartIdx)
            if (tagClosingIdx === -1) {
              console.warn(
                `Tag closing for fragment ID '${file.path}#${tocItem.contentFragmentId}' not found`
              )
              return
            }
            fileContent =
              fileContent.substr(0, tagClosingIdx + 1) +
              marker +
              fileContent.substr(tagClosingIdx + 2)
          }
        })
      }
      return fileContent
    })
    .join("")
}

// const getContent = async (
//   archive: zip,
//   manifest: IOpfManifest,
//   spine: IOpfSpine,
//   itemsDir: string
// ): Promise<string> => {
//   const itemContentPromises = spine.itemRefs.map(async ({ idRef }) => {
//     const item = manifest.items.find(_item => _item.id === idRef)
//     if (!item) {
//       console.warn(`Item with idRef '${idRef}' not present in the manifest`)
//       return
//     }
//     const itemPath = path.join(itemsDir, item.href)
//     const itemFile = archive.file(itemPath)
//     if (!itemFile) {
//       console.warn(`File for item with path '${itemPath}' not found`)
//       return
//     }
//     return stripHtml(await itemFile.async("text"))
//   })
//   return (await Promise.all(itemContentPromises)).join("")
// }

const div = document.createElement("div")
const stripHtml = (input: string): string => {
  div.innerHTML = input
  return div.textContent || ""
}

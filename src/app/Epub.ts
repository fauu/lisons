import * as zip from "jszip"
import * as path from "path"

import { punctuationLikeChars } from "~/app/data/PunctuationLikeChars"
import { ILanguage, ITextSectionTree, ITextSectionTreeNode, TextChunkMap } from "~/app/model"

import { ITextFileMetadata } from "~/library/model"
import { ensurePathExists, writeFile } from "~/util/FileUtils"

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

let _domParserInstance: DOMParser
const parseXml = (s: string, mimetype: string) => {
  if (!_domParserInstance) {
    _domParserInstance = new DOMParser()
  }
  return _domParserInstance.parseFromString(s, mimetype)
}

export const loadMetadata = async (buffer: Buffer): Promise<ITextFileMetadata> => {
  const archive = await zip.loadAsync(buffer)

  const opfPath = await getOpfPath(archive)
  const opfFragment = await getOpfFragment(archive, opfPath)
  const opfMetadata = getOpfMetadata(opfFragment)

  return { author: opfMetadata.creator, title: opfMetadata.title, language: opfMetadata.language }
}

export const convertEpubToLisonsText = async (
  textPath: string,
  buffer: Buffer,
  contentLanguage: ILanguage
): Promise<[TextChunkMap, ITextSectionTree | undefined]> => {
  const archive = await zip.loadAsync(buffer)

  const opfPath = await getOpfPath(archive)
  const opfFragment = await getOpfFragment(archive, opfPath)
  const opfManifest = getOpfManifest(opfFragment, [
    "application/xhtml+xml",
    "application/x-dtbncx+xml"
  ])
  const opfSpine = getOpfSpine(opfFragment)
  const itemsDir = path.dirname(opfPath)

  const serializer = new XMLSerializer()
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
      const itemHtmlDocument = parseXml(itemHtmlContent, "text/xml")

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

  const sectionTree = await getSectionTree(archive, opfManifest, opfSpine, itemsDir)

  return [textChunkMap, sectionTree]
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

const getOpfPath = async (archive: zip): Promise<string> => {
  const containerFile = archive.file("META-INF/container.xml")
  if (!containerFile) {
    throw new Error("'container.xml' not found")
  }
  const containerDocument = parseXml(await containerFile.async("text"), "text/xml")
  const rootfileElement = containerDocument.querySelector("rootfile")
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

const parseTocNavLabel = (navLabel: Element): string | undefined => {
  if (navLabel.children.length !== 1) {
    console.warn(`Expected 1 element inside <navLabel>, got ${navLabel.children.length}`)
    return
  }
  const onlyChild = navLabel.children[0]
  if (onlyChild.tagName.toLowerCase() !== "text" || onlyChild.textContent === null) {
    console.warn("<navLabel> has no <text> or its content is empty")
    return
  }
  return onlyChild.textContent
}

const parseTocContent = (content: Element): string | undefined => {
  const src = content.getAttribute("src")
  if (!src) {
    console.warn("<content> has no 'src' attribute")
    return
  }
  return src
}

const parseTocNavPoint = (navPoint: Element): ITextSectionTreeNode | undefined => {
  let label
  let contentFilePath
  let contentFragmentId
  const children = []
  for (const childEl of navPoint.children) {
    switch (childEl.tagName.toLowerCase()) {
      case "navlabel":
        label = parseTocNavLabel(childEl)
        break
      case "content":
        const src = parseTocContent(childEl)
        if (src) {
          // XXX: Prettier plugin messes this up, '// prettier-ignore' doesn't help
          // [contentFilePath, contentFragmentId] = src.split("#")
          const splitSrc = src.split("#")
          contentFilePath = splitSrc[0]
          if (splitSrc.length === 2) {
            contentFragmentId = splitSrc[1]
          } else if (splitSrc.length > 2) {
            console.warn(`Encountered more than one '#' in <content> src: '${src}'`)
          }
        }
        break
      case "navpoint":
        const childNavPoint = parseTocNavPoint(childEl)
        if (childNavPoint) {
          children.push(childNavPoint)
        }
        break
      default:
        console.warn(`Encountered unexpected element '${childEl.tagName}' inside <navPoint>`)
    }
  }
  if (!label) {
    console.warn("<navLabel> missing in <navPoint>")
    return
  }
  if (!contentFilePath) {
    console.warn("<content> src missing in <navPoint>")
    return
  }
  return { label, contentFilePath, contentFragmentId, children }
}

const parseTocNavMap = async (navMap: Element): Promise<ITextSectionTree> => {
  const topLevelNodes = []
  for (const childEl of navMap.children) {
    if (childEl.tagName.toLowerCase() !== "navpoint") {
      console.warn(`Encountered unexpected element '${childEl.tagName}' inside <navMap>`)
      continue
    }
    const navPoint = parseTocNavPoint(childEl)
    if (navPoint) {
      topLevelNodes.push(navPoint)
    }
  }
  return { root: { label: "root", contentFilePath: "/", children: topLevelNodes } }
}

const getSectionTree = async (
  archive: zip,
  manifest: IOpfManifest,
  spine: IOpfSpine,
  itemsDir: string
): Promise<ITextSectionTree | undefined> => {
  if (!spine.toc) {
    return
  }
  const tocItem = manifest.items.find(item => item.id === spine.toc)
  if (!tocItem) {
    console.warn("Manifest has no TOC item despite the spine having TOC reference")
    return
  }
  const tocPath = path.join(itemsDir, tocItem.href)
  const tocFile = archive.file(tocPath)
  if (!tocFile) {
    console.warn("Referenced TOC file not found")
    return
  }
  const tocContent = await tocFile.async("text")
  const tocDocument = parseXml(tocContent, "text/xml")
  const navMapElement = tocDocument.querySelector("navMap")
  if (!navMapElement) {
    console.warn("TOC has no 'navMap' element")
    return
  }
  return parseTocNavMap(navMapElement)
}

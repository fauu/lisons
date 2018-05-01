import * as zip from "jszip"
import * as path from "path"

// TODO: class not needed
export class EpubParser {
  public static async fromBuffer(buffer: Buffer): Promise<IEpub | undefined> {
    const archive = await zip.loadAsync(buffer)

    const opfPath = await getOpfPath(archive)
    const opfFragment = await getOpfFragment(archive, opfPath)
    const opfMetadata = getOpfMetadata(opfFragment)
    console.log("OPF Metadata:", opfMetadata)
    const opfManifest = getOpfManifest(opfFragment)
    console.log("OPF Manifest:", opfManifest)
    const opfSpine = getOpfSpine(opfFragment)
    console.log("OPF Spine:", opfSpine)
    const itemsDir = path.dirname(opfPath)
    console.log("Items directory:", itemsDir)
    const content = await getContent(archive, opfManifest, opfSpine, itemsDir)
    if (content === "") {
      throw new Error("EPUB has no text content")
    }
    console.log("First 1000 characters of text content: ", content.substring(0, 1000))

    return { author: opfMetadata.creator, title: opfMetadata.title, content }
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

const getOpfManifest = (fragment: DocumentFragment): IOpfManifest => {
  const items = Array.from(fragment.querySelectorAll("manifest item"))
    .map(itemElement => {
      if (itemElement.getAttribute("media-type") === "application/xhtml+xml") {
        const id = itemElement.getAttribute("id")
        const href = itemElement.getAttribute("href")
        return id !== null && href !== null ? { id, href } : undefined
      }
      return undefined
    })
    .filter(item => item !== undefined)
  return { items: items as IOpfTextItem[] }
}

const getOpfSpine = (fragment: DocumentFragment): IOpfSpine => {
  const itemRefs = Array.from(fragment.querySelectorAll("spine itemref"))
    .map(itemRefElement => ({ idRef: itemRefElement.getAttribute("idref") }))
    .filter(itemRef => itemRef.idRef !== null)
  return { itemRefs: itemRefs as IOpfItemRef[] }
}

const getContent = async (
  archive: zip,
  manifest: IOpfManifest,
  spine: IOpfSpine,
  itemsDir: string
): Promise<string> => {
  const itemContentPromises = spine.itemRefs.map(async ({ idRef }) => {
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
    return itemFile.async("text")
  })
  return (await Promise.all(itemContentPromises)).join("")
}

export interface IEpub {
  title?: string
  author?: string
  content: string
}

interface IOpfMetadata {
  title?: string
  creator?: string
  language?: string
}

interface IOpfManifest {
  items: IOpfTextItem[]
}

interface IOpfTextItem {
  id: string
  href: string
}

interface IOpfSpine {
  itemRefs: IOpfItemRef[]
}

interface IOpfItemRef {
  idRef: string
}

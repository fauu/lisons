import * as zip from "jszip"

export class EpubParser {
  public static async fromBuffer(buffer: Buffer): Promise<IEpub> {
    const archive = await zip.loadAsync(buffer)
    const opfFragment = await getOpfFragment(archive)
    const opfMetadata = getOpfMetadata(opfFragment)
    const opfManifest = getOpfManifest(opfFragment)
    const opfSpine = getOpfSpine(opfFragment)

    console.log(opfMetadata)
    console.log(opfManifest)
    console.log(opfSpine)

    return { abc: 1 }
  }
}

const getOpfFragment = async (archive: zip): Promise<DocumentFragment> => {
  const containerFile = archive.file("META-INF/container.xml")
  if (containerFile === null) {
    throw new Error("'container.xml' not found")
  }
  const containerFileContent = await containerFile.async("text")
  const containerFragment = document.createRange().createContextualFragment(containerFileContent)
  const rootfileElement = containerFragment.querySelector("rootfile")
  if (rootfileElement === null) {
    throw new Error("'rootfile' element not found")
  }
  const fullpathValue = rootfileElement.getAttribute("full-path")
  if (fullpathValue === null) {
    throw new Error("'full-path' attribute not found")
  }
  const opfFile = archive.file(fullpathValue)
  if (opfFile === null) {
    throw new Error(`OPF file not found at '${fullpathValue}'`)
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

export interface IEpub {
  abc: number
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

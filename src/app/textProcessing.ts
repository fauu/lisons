import * as zip from "jszip";
import * as path from "path";

import { Language, TextChunkMap, TextSectionTree, TextSectionTreeNode } from "~/app/model";
import { getWrapWordsInTagsFn } from "~/app/tokenization";

import { TextFileMetadata } from "~/library/model";
import { ensurePathExists, writeFile } from "~/util/fileUtils";

interface OpfMetadata {
  title?: string;
  creator?: string;
  language?: string;
}

interface OpfManifest {
  items: OpfItem[];
}

interface OpfItem {
  id: string;
  mediaType: string;
  href: string;
}

interface OpfSpine {
  toc?: string;
  itemRefs: OpfItemRef[];
}

interface OpfItemRef {
  idRef: string;
}

const { parseXml } = new class {
  private parser?: DOMParser;
  public parseXml = (s: string, mimetype: string) => {
    if (!this.parser) {
      this.parser = new DOMParser();
    }
    return this.parser.parseFromString(s, mimetype);
  };
}();

// TODO: Move magic strings to consts
// TODO: Single dispatch fucntion for storePlaintextContent and storeEpubContent?

export const storePlaintextContent = async (
  textPath: string,
  plaintext: string,
  contentLanguage: Language
): Promise<TextChunkMap> => {
  const [newContent, wordCount] = await getWrapWordsInTagsFn(contentLanguage)(plaintext);
  writeFile<string>(
    path.join(textPath, "content.html"),
    `<html>
      <head>
        <meta charset='utf-8' />
      </head>
      <body>
        ${newContent}
      </body>
     </html>`
  );
  return [{ id: "content", href: "content.html", wordCount, startWordNo: 0 }];
};

export const metadataFromEpub = async (buffer: Buffer): Promise<TextFileMetadata> => {
  const archive = await zip.loadAsync(buffer);

  const opfPath = await getOpfPath(archive);
  const opfFragment = await getOpfFragment(archive, opfPath);
  const opfMetadata = getOpfMetadata(opfFragment);

  return { author: opfMetadata.creator, title: opfMetadata.title, language: opfMetadata.language };
};

export const storeEpubContent = async (
  textPath: string,
  buffer: Buffer,
  contentLanguage: Language
): Promise<[string | undefined, TextChunkMap, TextSectionTree | undefined]> => {
  const archive = await zip.loadAsync(buffer);

  const opfPath = await getOpfPath(archive);
  const opfFragment = await getOpfFragment(archive, opfPath);
  const opfManifest = getOpfManifest(opfFragment, [
    "application/xhtml+xml",
    "application/x-dtbncx+xml"
  ]);
  const opfSpine = getOpfSpine(opfFragment);
  const itemsDir = path.dirname(opfPath);

  const serializer = new XMLSerializer();
  const wrapWordsInTags = getWrapWordsInTagsFn(contentLanguage);

  const textChunkMap: TextChunkMap = [];
  let coverPath;

  for (const item of opfManifest.items) {
    const itemPath = path.join(textPath, item.href);
    await ensurePathExists(path.dirname(itemPath));
    const itemFile = archive.file(path.join(itemsDir, item.href));

    if (item.mediaType !== "application/xhtml+xml") {
      if (item.id.includes("cover")) {
        coverPath = item.href;
      }
      writeFile<Buffer>(itemPath, await itemFile.async("nodebuffer"));
    } else {
      let chunkWordCount = 0;
      const itemHtmlContent = await itemFile.async("text");
      const itemHtmlDocument = parseXml(itemHtmlContent, "text/xml");

      itemHtmlDocument.head.innerHTML =
        "<meta charset='utf-8' />" + itemHtmlDocument.head.innerHTML;

      const treeWalker = document.createTreeWalker(
        itemHtmlDocument.body,
        NodeFilter.SHOW_TEXT,
        { acceptNode: _ => NodeFilter.FILTER_ACCEPT },
        false
      );
      while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode;
        if (!node.textContent || node.textContent.trim() === "") {
          continue;
        }
        const [newTextContent, wordCount] = await wrapWordsInTags(node.textContent);
        node.textContent = newTextContent;
        chunkWordCount += wordCount;
      }

      let newItemHtmlContent = serializer.serializeToString(itemHtmlDocument);
      newItemHtmlContent = newItemHtmlContent.replace(/&gt;/g, ">");
      newItemHtmlContent = newItemHtmlContent.replace(/&lt;/g, "<");

      textChunkMap.push({
        id: item.id,
        href: item.href,
        wordCount: chunkWordCount,
        startWordNo: -1
      });
      writeFile<string>(itemPath, newItemHtmlContent);
    }
  }

  textChunkMap.sort(
    (a, b) =>
      opfSpine.itemRefs.findIndex(ref => ref.idRef === a.id) -
      opfSpine.itemRefs.findIndex(ref => ref.idRef === b.id)
  );

  let currentWordCount = 0;
  textChunkMap.forEach(chunk => {
    chunk.startWordNo = currentWordCount;
    currentWordCount += chunk.wordCount;
  });

  const sectionTree = await getSectionTree(archive, opfManifest, opfSpine, itemsDir);

  return [coverPath, textChunkMap, sectionTree];
};

const getOpfPath = async (archive: zip): Promise<string> => {
  const containerFile = archive.file("META-INF/container.xml");
  if (!containerFile) {
    throw new Error("'container.xml' not found");
  }
  const containerDocument = parseXml(await containerFile.async("text"), "text/xml");
  const rootfileElement = containerDocument.querySelector("rootfile");
  if (!rootfileElement) {
    throw new Error("'rootfile' element not found");
  }
  const fullpathValue = rootfileElement.getAttribute("full-path");
  if (!fullpathValue) {
    throw new Error("'full-path' attribute not found");
  }
  return fullpathValue;
};

const getOpfFragment = async (archive: zip, opfPath: string): Promise<DocumentFragment> => {
  const opfFile = archive.file(opfPath);
  if (opfFile === null) {
    throw new Error(`OPF file not found at '${opfPath}'`);
  }
  return document.createRange().createContextualFragment(await opfFile.async("text"));
};

const getOpfMetadata = (fragment: DocumentFragment): OpfMetadata => {
  const opfMetadata = {};
  const fieldNames = ["title", "creator", "language"];
  fieldNames.forEach(fieldName => {
    const element = fragment.querySelector(`metadata > dc\\:${fieldName}`);
    if (element && element.textContent) {
      opfMetadata[fieldName] = element.textContent;
    }
  });
  return opfMetadata;
};

const getOpfManifest = (fragment: DocumentFragment, acceptedMediaTypes: string[]): OpfManifest => {
  const items = Array.from(fragment.querySelectorAll("manifest item"))
    .map(itemElement => {
      const mediaType = itemElement.getAttribute("media-type") || "";
      const id = itemElement.getAttribute("id");
      if (acceptedMediaTypes.includes(mediaType) || id === "ncx" || (id && id.includes("cover"))) {
        const href = itemElement.getAttribute("href");
        return id !== null && href !== null ? { id, mediaType, href } : undefined;
      }
      return undefined;
    })
    .filter(item => item !== undefined);
  return { items: items as OpfItem[] };
};

const getOpfSpine = (fragment: DocumentFragment): OpfSpine => {
  const spineElement = fragment.querySelector("spine");
  if (!spineElement) {
    throw new Error("The OPF file is spineless");
  }
  let tocValue: string | null | undefined = spineElement.getAttribute("toc");
  if (!tocValue || tocValue === "") {
    tocValue = undefined;
    console.warn("Spine has no toc reference");
  }

  const itemRefs = Array.from(fragment.querySelectorAll("spine itemref"))
    .map(itemRefElement => ({ idRef: itemRefElement.getAttribute("idref") }))
    .filter(itemRef => itemRef.idRef !== null);
  return {
    toc: tocValue,
    itemRefs: itemRefs as OpfItemRef[]
  };
};

const parseTocNavLabel = (navLabel: Element): string | undefined => {
  if (navLabel.children.length !== 1) {
    console.warn(`Expected 1 element inside <navLabel>, got ${navLabel.children.length}`);
    return;
  }
  const onlyChild = navLabel.children[0];
  if (onlyChild.tagName.toLowerCase() !== "text" || onlyChild.textContent === null) {
    console.warn("<navLabel> has no <text> or its content is empty");
    return;
  }
  return onlyChild.textContent;
};

const parseTocContent = (content: Element): string | undefined => {
  const src = content.getAttribute("src");
  if (!src) {
    console.warn("<content> has no 'src' attribute");
    return;
  }
  return src;
};

const parseTocNavPoint = (navPoint: Element): TextSectionTreeNode | undefined => {
  const textSectionTreeNode: Partial<TextSectionTreeNode> = {};
  textSectionTreeNode.children = [];
  for (const childEl of navPoint.children) {
    switch (childEl.tagName.toLowerCase()) {
      case "navlabel":
        textSectionTreeNode.label = parseTocNavLabel(childEl);
        break;
      case "content":
        const src = parseTocContent(childEl);
        if (src) {
          [textSectionTreeNode.contentFilePath, textSectionTreeNode.contentFragmentId] = src.split(
            "#"
          );
        }
        break;
      case "navpoint":
        const childNavPoint = parseTocNavPoint(childEl);
        if (childNavPoint) {
          textSectionTreeNode.children.push(childNavPoint);
        }
        break;
      default:
        console.warn(`Encountered unexpected element '${childEl.tagName}' inside <navPoint>`);
    }
  }
  if (!textSectionTreeNode.label) {
    console.warn("<navLabel> missing in <navPoint>");
    return;
  }
  if (!textSectionTreeNode.contentFilePath) {
    console.warn("<content> src missing in <navPoint>");
    return;
  }
  return textSectionTreeNode as TextSectionTreeNode;
};

const parseTocNavMap = async (navMap: Element): Promise<TextSectionTree> => {
  const topLevelNodes = [];
  for (const childEl of navMap.children) {
    if (childEl.tagName.toLowerCase() !== "navpoint") {
      console.warn(`Encountered unexpected element '${childEl.tagName}' inside <navMap>`);
      continue;
    }
    const navPoint = parseTocNavPoint(childEl);
    if (navPoint) {
      topLevelNodes.push(navPoint);
    }
  }
  return { root: { label: "root", contentFilePath: "/", children: topLevelNodes } };
};

const getSectionTree = async (
  archive: zip,
  manifest: OpfManifest,
  spine: OpfSpine,
  itemsDir: string
): Promise<TextSectionTree | undefined> => {
  if (!spine.toc) {
    return;
  }
  const tocItem = manifest.items.find(item => item.id === spine.toc);
  if (!tocItem) {
    console.warn("Manifest has no TOC item despite the spine having TOC reference");
    return;
  }
  const tocPath = path.join(itemsDir, tocItem.href);
  const tocFile = archive.file(tocPath);
  if (!tocFile) {
    console.warn("Referenced TOC file not found");
    return;
  }
  const tocContent = await tocFile.async("text");
  const tocDocument = parseXml(tocContent, "text/xml");
  const navMapElement = tocDocument.querySelector("navMap");
  if (!navMapElement) {
    console.warn("TOC has no 'navMap' element");
    return;
  }
  return parseTocNavMap(navMapElement);
};

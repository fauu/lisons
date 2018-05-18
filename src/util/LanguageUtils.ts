import { languages } from "~/app/data/Languages";
import { Language } from "~/app/model";

export const languageFromCode6393 = (code6393: string): Language | undefined =>
  languages.find(l => l.code6393 === code6393);

export const languageFromCodeGt = (codeGt: string): Language | undefined =>
  languages.find(l => l.codeGt === codeGt);

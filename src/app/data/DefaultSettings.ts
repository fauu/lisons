import { ISettings } from "~/app/model"

export const defaultSettings: ISettings = {
  defaultTranslationLanguage: "eng",
  readerStyle: {
    width: 50,
    fontSize: 1.7,
    letterSpacing: -0.01,
    lineHeight: 1.4,
    background: "#ffe7d5",
    textColor: "#382d2d",
    fontFamily: "'PT Serif', Georgia, serif",
    textAlign: "left",
    selectionColor: "#dffea3",
    translationBgColor: "#222222",
    translationTextColor: "#fefefe"
  }
}

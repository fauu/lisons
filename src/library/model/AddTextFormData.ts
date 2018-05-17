import { Language } from "~/app/model"

export interface AddTextFormData {
  filePath: string
  pastedText: string
  title: string
  author: string
  contentLanguage: Language
  translationLanguage: Language
}

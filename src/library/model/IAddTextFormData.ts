import { ILanguage } from '~/app/model';

export interface IAddTextFormData {
  filePath: string
  pastedText: string
  title: string
  author: string
  contentLanguage: ILanguage
  translationLanguage: ILanguage
}

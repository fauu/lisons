import { action, observable, ObservableMap, runInAction } from "mobx"

import { IParsedText, ITextInfo, ITextProgress, Text } from "~/app/model"
import { TextRepository } from "~/app/TextRepository"

export class TextStore {
  public texts: ObservableMap<Text> = observable.shallowMap<Text>()

  public constructor(private _textRepository: TextRepository) {}

  public loadAll = async (): Promise<void> => {
    const texts = await this._textRepository.loadAll()
    runInAction(() => texts.forEach(t => this.texts.set(String(t.id), t)))
  }

  public async add(info: ITextInfo, parsed: IParsedText): Promise<void> {
    const newText = await this._textRepository.save(info, parsed)
    this.setText(newText)
  }

  public async delete(id: number): Promise<void> {
    await this._textRepository.delete(id)
    runInAction(() => this.texts.delete(String(id)))
  }

  // TODO: Make progress observable and sync automatically?
  public async setTextProgress(id: number, progress: ITextProgress): Promise<void> {
    const updatedText = this._textRepository.updateProgress(id, progress)
    this.setText(await updatedText)
  }

  @action
  private setText(text: Text): void {
    this.texts.set(String(text.id), text)
  }
}

import { action, observable, ObservableMap } from "mobx"

import { IParsedText, ITextInfo, ITextProgress, Text } from "~/app/model"
import { TextRepository } from "~/app/TextRepository"
import { flowed } from "~/util/Flowed"

export class TextStore {
  public texts: ObservableMap<number, Text> = observable.map<number, Text>(undefined, {
    deep: false
  })

  public constructor(private _textRepository: TextRepository) {}

  @flowed
  public *loadAll(): IterableIterator<Promise<Text[]>> {
    const texts: Text[] = yield this._textRepository.loadAll()
    texts.forEach(t => this.texts.set(t.id, t))
  }

  public async add(info: ITextInfo, parsed: IParsedText): Promise<void> {
    const newText = await this._textRepository.save(info, parsed)
    this.setText(newText)
  }

  @flowed
  public *delete(id: number): IterableIterator<Promise<void>> {
    yield this._textRepository.delete(id)
    this.texts.delete(id)
  }

  // TODO: Make progress observable and sync automatically?
  public async setTextProgress(id: number, progress: ITextProgress): Promise<void> {
    const updatedText = this._textRepository.updateProgress(id, progress)
    this.setText(await updatedText)
  }

  @action
  private setText(text: Text): void {
    this.texts.set(text.id, text)
  }
}

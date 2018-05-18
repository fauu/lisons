import { action, observable, ObservableMap } from "mobx";

import { ParsedText, Text, TextInfo, TextProgress } from "~/app/model";
import { TextRepository } from "~/app/textRepository";
import { flowed } from "~/util/mobxUtils";

export class TextStore {
  public texts: ObservableMap<number, Text> = observable.map<number, Text>(undefined, {
    deep: false
  });

  public constructor(private _textRepository: TextRepository) {}

  @flowed
  public *loadAll(): IterableIterator<Promise<Text[]>> {
    const texts: Text[] = yield this._textRepository.loadAll();
    texts.forEach(t => this.texts.set(t.id, t));
  }

  public async add(info: TextInfo, parsed: ParsedText): Promise<void> {
    const newText = await this._textRepository.save(info, parsed);
    this.setText(newText);
  }

  @flowed
  public *delete(id: number): IterableIterator<Promise<void>> {
    yield this._textRepository.delete(id);
    this.texts.delete(id);
  }

  // TODO: Make progress observable and sync automatically?
  public async setTextProgress(id: number, progress: TextProgress): Promise<void> {
    const updatedText = this._textRepository.updateProgress(id, progress);
    this.setText(await updatedText);
  }

  @action
  private setText(text: Text): void {
    this.texts.set(text.id, text);
  }
}

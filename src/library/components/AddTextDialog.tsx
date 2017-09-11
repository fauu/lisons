import { remote } from "electron"
import { action, autorun, observable, reaction } from "mobx"
import { observer } from "mobx-react"
import * as path from "path"
import * as React from "react"
import styled from "styled-components"

import { Spinner } from "~/app/components"
import { animations, colors, fonts } from "~/app/data/Style"
import { CloseIcon } from "~/app/Icons"
import { SettingsStore } from "~/app/stores"
import { withProps } from "~/util/StyleUtils"

import { LanguageSelect } from "~/library/components"
import { IAddTextFormData, IEpubInfo } from "~/library/model"
import { AddTextDialogStore } from "~/library/stores"

export interface IAddTextDialogProps {
  readonly settingsStore: SettingsStore
  readonly addTextDialogStore: AddTextDialogStore
}
@observer
export class AddTextDialog extends React.Component<IAddTextDialogProps> {
  private static readonly defaultContentLanguage = "fra"
  private static readonly defaultTranslationLanguage = "eng"

  @observable
  private formData: IAddTextFormData = {
    filePath: "",
    pastedText: "",
    title: "",
    author: "",
    contentLanguage: "",
    translationLanguage: ""
  }
  @observable private isPickingFile: boolean
  private settingsStore: SettingsStore
  private addTextDialogStore: AddTextDialogStore

  public componentWillMount(): void {
    this.settingsStore = this.props.settingsStore
    this.addTextDialogStore = this.props.addTextDialogStore
  }

  public componentDidMount(): void {
    this.clearForm()
    reaction(
      () => this.formData.filePath,
      filePath => this.addTextDialogStore.handleSelectedFilePathChange(filePath)
    )
    reaction(() => this.formData.pastedText, text => this.addTextDialogStore.setPastedContent(text))
    reaction(
      () => this.addTextDialogStore.loadedEpubInfo,
      epubInfo => this.handleEpubInfoLoad(epubInfo)
    )
    reaction(
      () => this.addTextDialogStore.detectedLanguage,
      lang => this.handleLanguageDetectionFinish(lang)
    )
    autorun(() => {
      this.addTextDialogStore.handleSelectedLanguagesChange([
        this.formData.contentLanguage,
        this.formData.translationLanguage
      ])
    })
  }

  public componentWillUnmount(): void {
    this.clearForm()
  }

  private clearForm(): void {
    this.updateFormData({
      filePath: "",
      pastedText: "",
      title: "",
      author: "",
      contentLanguage: AddTextDialog.defaultContentLanguage,
      translationLanguage:
        this.settingsStore.settings.defaultTranslationLanguage ||
        AddTextDialog.defaultTranslationLanguage
    })
    this.addTextDialogStore.discardLoadedFile()
  }

  @action
  private updateFormData(slice: any): void {
    Object.assign(this.formData, slice)
  }

  @action
  private setPickingFile(value: boolean): void {
    this.isPickingFile = value
  }

  private handlePastedTextChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    this.updateFormData({ pastedText: e.currentTarget.value })
  }

  private handleTitleChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.updateFormData({ title: e.currentTarget.value })
  }

  private handleAuthorChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.updateFormData({ author: e.currentTarget.value })
  }

  private handleContentLanguageChange = (e: any) => {
    this.updateFormData({ contentLanguage: e.target.value })
  }

  private handleTranslationLanguageChange = (e: any) => {
    this.updateFormData({ translationLanguage: e.target.value })
  }

  private handleLoadFileButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    this.setPickingFile(true)
    remote.dialog.showOpenDialog(
      {
        properties: ["openFile"]
      },
      filePaths => {
        this.setPickingFile(false)
        if (!filePaths) {
          return
        }
        const filePath = filePaths.toString()
        this.updateFormData({
          title: path.basename(filePath, path.extname(filePath)),
          filePath
        })
      }
    )
  }

  private handleDiscardSelectedFileButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    this.updateFormData({ filePath: "" })
  }

  private handleClearPasteTextAreaButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    this.updateFormData({ pastedText: "" })
  }

  private handleAddTextButtonClick = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    await this.addTextDialogStore.saveText(this.formData)
    this.settingsStore.set({
      defaultTranslationLanguage: this.formData.translationLanguage
    })
    this.clearForm()
  }

  private handleEpubInfoLoad(epubInfo?: IEpubInfo): void {
    if (epubInfo) {
      const { author, title } = epubInfo
      if (author) {
        this.updateFormData({ author })
      }
      if (title) {
        this.updateFormData({ title })
      }
    }
  }

  private handleLanguageDetectionFinish = (lang?: string): void => {
    this.formData.contentLanguage = lang || AddTextDialog.defaultContentLanguage
  }

  public render(): JSX.Element {
    const { pastedContent, isSavingText, textFileStatus } = this.addTextDialogStore
    const filePath = this.formData.filePath
    const showFinalFields = textFileStatus === "Valid" || pastedContent
    return (
      <Form unresponsive={isSavingText}>
        {isSavingText && (
          <SavingIndicatorOverlay>
            <Spinner color={"Dark"} />
          </SavingIndicatorOverlay>
        )}
        {!pastedContent && this.renderFileField()}
        {!filePath && this.renderPasteField()}
        {showFinalFields && this.renderFinalFields()}
        {textFileStatus === "Invalid" && (
          <InvalidFileMsg>Selected file cannot be added.</InvalidFileMsg>
        )}
      </Form>
    )
  }

  private renderFileField(): JSX.Element {
    const status = this.addTextDialogStore.textFileStatus
    return (
      <FileField>
        <Button onClick={this.handleLoadFileButtonClick} disabled={this.isPickingFile}>
          {status === "NotAdded" ? "Choose .epub or .txt file" : "Change my choice"}
        </Button>
        {this.formData.filePath && (
          <SelectedFileGroup>
            <SelectedFileName>{path.basename(this.formData.filePath)}</SelectedFileName>
            <ClearButton onClick={this.handleDiscardSelectedFileButtonClick} />
          </SelectedFileGroup>
        )}
      </FileField>
    )
  }

  private renderPasteField(): JSX.Element {
    return (
      <PasteField>
        <PasteFieldHeader>
          {this.formData.pastedText ? (
            <span>Content:</span>
          ) : (
            <span>…or paste from clipboard:</span>
          )}
          {this.formData.pastedText && (
            <ClearButton onClick={this.handleClearPasteTextAreaButtonClick} />
          )}
        </PasteFieldHeader>
        <TextArea
          rows={5}
          onChange={this.handlePastedTextChange}
          value={this.formData.pastedText}
        />
      </PasteField>
    )
  }

  private renderFinalFields(): JSX.Element {
    const { isLanguageConfigurationInvalid, tatoebaTranslationCount } = this.addTextDialogStore
    return (
      <FinalFields>
        <Field>
          Author:
          <TextInput type="text" onChange={this.handleAuthorChange} value={this.formData.author} />
        </Field>
        <Field>
          Title:
          <TextInput type="text" onChange={this.handleTitleChange} value={this.formData.title} />
        </Field>
        <FieldGroup>
          <Field>
            Text language:
            <LanguageSelect
              invalid={isLanguageConfigurationInvalid}
              onChange={this.handleContentLanguageChange}
              value={this.formData.contentLanguage}
            />
          </Field>
          <Field>
            Translation language:
            <LanguageSelect
              invalid={isLanguageConfigurationInvalid}
              onChange={this.handleTranslationLanguageChange}
              value={this.formData.translationLanguage}
            />
          </Field>
        </FieldGroup>
        {tatoebaTranslationCount && this.renderTatoebaTranslationCount()}
        <AddTextButton
          onClick={this.handleAddTextButtonClick}
          disabled={isLanguageConfigurationInvalid}
        >
          Add
        </AddTextButton>
      </FinalFields>
    )
  }

  private renderTatoebaTranslationCount(): JSX.Element {
    const { state, value } = this.addTextDialogStore.tatoebaTranslationCount as any
    return (
      <Message>
        {state === "fulfilled" && (
          <MessageText>
            {value > 0 ? value : "No"} Tatoeba translations available for the selected language
            configuration.
          </MessageText>
        )}
      </Message>
    )
  }
}

const fieldMargin = "1.3rem"

const Form = withProps<{ unresponsive: boolean }>()(styled.form)`
  position: relative;
  margin-top: 1rem;
  font-size: 0.95em;
  ${p => (p.unresponsive ? "* { pointer-events: none }" : "")}

  input, select, button, textarea {
    display: block;
    padding: 0.6rem;
    margin-top: 0.5rem;
    color: ${colors.primary};
    background: ${colors.inputBg};
    border: 2px solid ${colors.primary};
    border-radius: 3px;
    font-size: 1em;
    transition: all 0.05s ${animations.stdFunction};
    &:disabled,
    &:hover:disabled {
      color: ${colors.primaryFade};
      border-color: ${colors.primaryFade};
    }
    &:hover:not(:disabled) {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
      transform: translate(0, -1px);
    }
    &:active {
      box-shadow: initial;
      transform: initial;
    }
  }
`

const SavingIndicatorOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.secondary}cc;
  animation: ${animations.fadeIn} ${animations.std};
`

const FieldGroup = styled.div`
  display: flex;
  justify-content: space-between;
  > label:nth-child(2) {
    margin-left: 2rem;
  }
`

const Field = styled.label`
  display: inline-block;
  width: 100%;
  margin-bottom: ${fieldMargin};
`

const Message = styled.div`
  height: 1em;
  margin-bottom: ${fieldMargin};
`

const MessageText = styled.span`
  font-size: 0.9em;
  animation: ${animations.fadeIn} ${animations.std};
`

const FileField = Field.extend`
  display: flex;
  align-items: center;
`

const PasteField = Field.extend`
  display: flex;
  flex-direction: column;
`

const PasteFieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

// TODO: DRY (sidebar header ActionButton)
const ClearButton = withProps<any>()(styled(CloseIcon))`
  // XXX
  fill: rgba(0, 0, 0, 0.5);
  transition: fill 0.2s ease;
  &:hover {
    fill: rgba(0, 0, 0, 0.7);
  }
  &:not(:last-child) {
    margin-right: 0.6rem;
  }
`

const TextArea = styled.textarea`
  resize: none;
  margin-top: 0.7rem;
  font: 1em ${fonts.serif};
`

const FinalFields = styled.div`animation: ${animations.fadeInBottom} ${animations.doubleTime};`

const TextInput = styled.input`width: 100%;`

const Button = styled.button``

const InvalidFileMsg = styled.span`animation: ${animations.fadeInBottom} ${animations.doubleTime};`

const AddTextButton = Button.extend`
  margin-top: 1rem;
  width: 100%;
  border: 3px solid ${colors.accent} !important;
  color: ${colors.accent} !important;
  font-weight: bold;
  transition: all 0.05s ${animations.stdFunction};
  &:hover {
    color: ${colors.accent2} !important;
    border-color: ${colors.accent2} !important;
  }
`

const SelectedFileGroup = styled.span`display: flex;`

const SelectedFileName = styled.span`
  margin: 0 0.5rem 0 1rem;
  max-width: 28rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: ${animations.fadeIn} ${animations.doubleTime};
`

import { CloseIcon } from "mdi-react";
import { observer } from "mobx-react";
import * as path from "path";
import * as React from "react";
import styled from "styled-components";

import { Spinner } from "~/app/components";
import { animations, colors, fonts } from "~/app/data/style";

import { LanguageSelect } from "~/library/components";
import { AddTextDialogStore } from "~/library/stores";

type FormEventHandler<T> = React.EventHandler<React.FormEvent<T>>;

export interface AddTextDialogProps {
  store: AddTextDialogStore;
  onLoadFileButtonClick: FormEventHandler<HTMLButtonElement>;
  onDiscardSelectedFileButtonClick: FormEventHandler<HTMLButtonElement>;
  onPastedTextChange: FormEventHandler<HTMLTextAreaElement>;
  onClearPasteTextAreaButtonClick: FormEventHandler<HTMLButtonElement>;
  onAuthorChange: FormEventHandler<HTMLInputElement>;
  onTitleChange: FormEventHandler<HTMLInputElement>;
  onAddTextButtonClick: FormEventHandler<HTMLButtonElement>;
  onContentLanguageChange: any;
  onTranslationLanguageChange: any;
}
@observer
export class AddTextDialog extends React.Component<AddTextDialogProps> {
  public render(): JSX.Element {
    const { isSavingText, fileStatus } = this.props.store;
    const { filePath, pastedText } = this.props.store.formData;
    const showFinalFields = fileStatus === "Valid" || pastedText;
    return (
      <Form disabled={isSavingText}>
        {isSavingText && (
          <SavingIndicatorOverlay>
            <Spinner color={"Dark"} />
          </SavingIndicatorOverlay>
        )}
        {!pastedText && this.renderFileField()}
        {!filePath && this.renderPasteField()}
        {showFinalFields && this.renderFinalFields()}
        {fileStatus === "Invalid" && <InvalidFileMsg>This file cannot be added.</InvalidFileMsg>}
      </Form>
    );
  }

  private renderFileField(): JSX.Element {
    const { fileStatus, isPickingFile } = this.props.store;
    const { filePath } = this.props.store.formData;
    return (
      <FileField>
        <Button onClick={this.props.onLoadFileButtonClick} disabled={isPickingFile}>
          {fileStatus === "NotSelected" ? "Choose .epub or .txt file" : "Change my choice"}
        </Button>
        {filePath && (
          <SelectedFileGroup>
            <SelectedFileName>{path.basename(filePath)}</SelectedFileName>
            <ClearButton onClick={this.props.onDiscardSelectedFileButtonClick} />
          </SelectedFileGroup>
        )}
      </FileField>
    );
  }

  private renderPasteField(): JSX.Element {
    const { pastedText } = this.props.store.formData;
    return (
      <PasteField>
        <PasteFieldHeader>
          {pastedText ? <span>Content:</span> : <span>…or paste from clipboard:</span>}
          {pastedText && <ClearButton onClick={this.props.onClearPasteTextAreaButtonClick} />}
        </PasteFieldHeader>
        <TextArea rows={5} onChange={this.props.onPastedTextChange} value={pastedText} />
      </PasteField>
    );
  }

  private renderFinalFields(): JSX.Element {
    const { isLanguageConfigurationValid, tatoebaTranslationCount } = this.props.store;
    const { author, title, contentLanguage, translationLanguage } = this.props.store.formData;
    return (
      <FinalFields>
        <Field>
          Author:
          <TextInput type="text" onChange={this.props.onAuthorChange} value={author} />
        </Field>
        <Field>
          Title:
          <TextInput type="text" onChange={this.props.onTitleChange} value={title} />
        </Field>
        <FieldGroup>
          <Field>
            Text language:
            <LanguageSelect
              invalid={!isLanguageConfigurationValid}
              onChange={this.props.onContentLanguageChange}
              value={contentLanguage.code6393}
            />
          </Field>
          <Field>
            Translation language:
            <LanguageSelect
              invalid={!isLanguageConfigurationValid}
              onChange={this.props.onTranslationLanguageChange}
              value={translationLanguage.code6393}
            />
          </Field>
        </FieldGroup>
        {tatoebaTranslationCount && this.renderTatoebaTranslationCount()}
        <AddTextButton
          onClick={this.props.onAddTextButtonClick}
          disabled={!isLanguageConfigurationValid}
        >
          Add
        </AddTextButton>
      </FinalFields>
    );
  }

  private renderTatoebaTranslationCount(): JSX.Element {
    const { state, value } = this.props.store.tatoebaTranslationCount as any;
    return (
      <Message>
        {state === "fulfilled" && (
          <MessageText>
            {value > 0 ? value : "No"} Tatoeba translations available for the selected language
            configuration.
          </MessageText>
        )}
      </Message>
    );
  }
}

const fieldMargin = "1.3rem";

const Form = styled.form`
  position: relative;
  margin-top: 1rem;
  font-size: 0.95em;
  ${(p: { disabled: boolean }) => (p.disabled ? "* { pointer-events: none; }" : ";")};

  input,
  select,
  button,
  textarea {
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
      color: ${colors.primaryFade} !important;
      border-color: ${colors.primaryFade} !important;
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
`;

const SavingIndicatorOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.secondary}cc;
  animation: ${animations.fadeIn} ${animations.std};
`;

const FieldGroup = styled.div`
  display: flex;
  justify-content: space-between;
  > label:nth-child(2) {
    margin-left: 2rem;
  }
`;

const Field = styled.label`
  display: inline-block;
  width: 100%;
  margin-bottom: ${fieldMargin};
`;

const Message = styled.div`
  height: 1em;
  margin-bottom: ${fieldMargin};
`;

const MessageText = styled.span`
  font-size: 0.9em;
  animation: ${animations.fadeIn} ${animations.std};
`;

const FileField = Field.extend`
  display: flex;
  align-items: baseline;
`;

const PasteField = Field.extend`
  display: flex;
  flex-direction: column;
`;

const PasteFieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

// TODO: DRY (sidebar header ActionButton)
const ClearButton = styled<any, any>(CloseIcon)`
  fill: rgba(0, 0, 0, 0.5);
  transition: fill 0.2s ease;
  &:hover {
    fill: rgba(0, 0, 0, 0.7);
  }
  &:not(:last-child) {
    margin-right: 0.6rem;
  }
`;

const TextArea = styled.textarea`
  resize: none;
  margin-top: 0.7rem;
  font: 1em ${fonts.serif};
`;

const FinalFields = styled.div`
  animation: ${animations.fadeInBottom} ${animations.doubleTime};
`;

const TextInput = styled.input`
  width: 100%;
`;

const Button = styled.button``;

const InvalidFileMsg = styled.span`
  animation: ${animations.fadeInBottom} ${animations.doubleTime};
`;

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
`;

const SelectedFileGroup = styled.span`
  display: flex;
`;

const SelectedFileName = styled.span`
  margin: 0 0.5rem 0 1rem;
  max-width: 24.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: ${animations.fadeIn} ${animations.doubleTime};
`;

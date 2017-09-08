import debounce = require("lodash/debounce")
import { action, observable, reaction } from "mobx"
import { observer } from "mobx-react"
import * as React from "react"
import styled from "styled-components"

import { defaultSettings } from "~/app/data/DefaultSettings"
import { IReaderStyleSettings } from "~/app/model"
import { SettingsStore } from "~/app/stores"
import { withProps } from "~/util/StyleUtils"

import { SidebarStore } from "~/reader/stores"

interface IRangeInputProps {
  readonly min: number
  readonly max: number
  readonly step: number
}
type SelectInputOptions = Array<[string, string]>
type FormModelElementOptions = IRangeInputProps | SelectInputOptions | {}
type FormModelElement = [string, string, string, FormModelElementOptions]
const formModel: FormModelElement[] = [
  ["Background color", "background", "color", {}],
  ["Text color", "textColor", "color", {}],
  ["Font family", "fontFamily", "text", {}],
  ["Font size", "fontSize", "range", { min: 1, max: 3, step: 0.05 }],
  ["Letter spacing", "letterSpacing", "range", { min: -0.05, max: 0.05, step: 0.01 }],
  ["Text width", "width", "range", { min: 30, max: 60, step: 2 }],
  [
    "Text alignment",
    "textAlign",
    "select",
    [["Left", "left"], ["Justified", "justify"], ["Center", "center"], ["Right", "right"]]
  ],
  ["Line height", "lineHeight", "range", { min: 1, max: 2, step: 0.1 }],
  ["Selection color", "selectionColor", "color", {}],
  ["Translation pop-up background color", "translationBgColor", "color", {}],
  ["Translation pop-up text color", "translationTextColor", "color", {}]
]

export interface ISettingsProps {
  readonly sidebarStore: SidebarStore
  readonly settingsStore: SettingsStore
}
@observer
export class Settings extends React.Component<ISettingsProps> {
  private static readonly commitDebounceMs = 200

  @observable private formData: IReaderStyleSettings = defaultSettings.readerStyle

  private settingsStore: SettingsStore
  private sidebarStore: SidebarStore

  public componentWillMount(): void {
    this.settingsStore = this.props.settingsStore
    this.sidebarStore = this.props.sidebarStore
    Object.assign(this.formData, this.settingsStore.settings.readerStyle)
  }

  public componentDidMount(): void {
    reaction(
      () => this.formData,
      readerStyle => {
        this.commit(readerStyle)
      }
    )
  }

  // tslint:disable-next-line:member-ordering
  private commit = debounce((readerStyle: IReaderStyleSettings) => {
    this.settingsStore.set({ readerStyle })
  }, Settings.commitDebounceMs)

  private handleFieldChange = (fieldName: string) =>
    action((e: React.FormEvent<HTMLInputElement>) => {
      this.formData = {
        ...this.formData,
        [`${fieldName}`]: e.currentTarget.value
      }
    })

  private handleDoneButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    this.sidebarStore.setSettingsTabActive(false)
    e.preventDefault()
  }

  @action
  private handleResetButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    this.formData = defaultSettings.readerStyle
    e.preventDefault()
  }

  public render(): JSX.Element {
    return (
      <Form>
        <div>
          {formModel.map(([labelText, key, type, options]) => (
            <Field key={key}>
              <Label>{labelText}:</Label>
              {this.renderInput(key, type, options)}
            </Field>
          ))}
          <Button onClick={this.handleDoneButtonClick}>Done</Button>
        </div>
        <Button warning onClick={this.handleResetButtonClick}>
          Reset to defaults
        </Button>
      </Form>
    )
  }

  private renderInput(key: string, type: string, options: FormModelElementOptions): JSX.Element {
    if (type === "select") {
      return (
        <Select value={this.formData[key]} onChange={this.handleFieldChange(key) as any}>
          {(options as SelectInputOptions).map(([label, value]) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>
      )
    }
    return (
      <Input
        type={type}
        value={this.formData[key]}
        onChange={this.handleFieldChange(key)}
        {...options}
      />
    )
  }
}

const Form = styled.form`
  height: 100%;
  padding: 1.25rem 2rem;
  font-size: 0.9em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const Field = styled.label`
  display: flex;
  margin-bottom: 1rem;
`

const Label = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  padding-right: 1em;
`

const Input = styled.input`
  flex: 2;
  background: rgba(255, 255, 255, 0.12);
  color: #fefefe;
  border: 2px solid rgba(255, 255, 255, 0.24);
  font-size: 0.95em;
  padding: 0.5rem;
  &:hover {
    transform: translate(0, -1px);
  }
  &:not([type="range"]):hover {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  }

  &[type="range"] {
    -webkit-appearance: none;
    background: rgba(255, 255, 255, 0.12);
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 2.3rem;
      width: 16px;
      background: rgba(255, 255, 255, 0.24);
      margin: -0.5rem 0;
    }
    &:focus {
      outline: none;
    }
  }
`

// XXX: DRY
const Select = styled.select`
  flex: 2;
  background: rgba(255, 255, 255, 0.12);
  color: #fefefe;
  border: 2px solid rgba(255, 255, 255, 0.24);
  font-size: 0.95em;
  padding: 0.5rem;
  &:hover {
    transform: translate(0, -1px);
  }
`

const Option = styled.option`
  background: #444;
  color: #fefefe;
  border: 2px solid rgba(255, 255, 255, 0.24);
  font-size: 0.95em;
  padding: 0.5rem;
`

const Button = withProps<{ warning?: boolean }>()(styled.button)`
  width: 100%;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid;
  color: #${p => (p.warning ? "f7ca28" : "fefefe")};
  border-color: #${p => (p.warning ? "rgba(247, 202, 40, 0.5)" : "rgba(255, 255, 255, 0.24)")};
  padding: 0.5rem 0.6rem;
  transition: all 0.05s ease-out;
  font-size: 0.9em;
  &:hover {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transform: translate(0, -1px);
  }
  &:active {
    box-shadow: initial;
    transform: initial;
  }
`

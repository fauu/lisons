import * as React from "react"
import styled from "styled-components"

import { languages } from "~/app/data/Languages"
import { colors } from "~/app/data/Style"
import { withProps } from "~/util/StyleUtils"

export interface ILanguageSelectProps {
  readonly value: string
  readonly invalid: boolean
  readonly onChange: (e: any) => void
}
export function LanguageSelect({ value, invalid, onChange }: ILanguageSelectProps): JSX.Element {
  return (
    <Select value={value} invalid={invalid} onChange={onChange}>
      {languages.map(l => (
        <option key={l.code6393} value={l.code6393}>
          {l.name}
        </option>
      ))}
    </Select>
  )
}

// TODO: DRY
const Select = withProps<ILanguageSelectProps>()(styled.select)`
  width: 100%;
  border: 2px solid ${p => (p.invalid ? colors.danger : colors.primary)} !important;
`

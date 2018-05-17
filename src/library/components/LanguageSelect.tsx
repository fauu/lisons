import * as React from "react"
import styled from "styled-components"

import { languages } from "~/app/data/Languages"
import { colors } from "~/app/data/Style"
import { withProps } from "~/util/StyleUtils"

export interface LanguageSelectProps {
  readonly value: string
  readonly invalid: boolean
  readonly onChange: (e: any) => void
}
export function LanguageSelect({ value, invalid, onChange }: LanguageSelectProps): JSX.Element {
  return (
    <Select value={value} invalid={invalid} onChange={onChange}>
      {languages.map(l => (
        <option key={l.code6393} value={l.code6393}>
          {l.localName}
        </option>
      ))}
    </Select>
  )
}

// TODO: DRY
const Select = withProps<LanguageSelectProps>()(styled.select)`
  width: 100%;
  border: 2px solid ${p => (p.invalid ? colors.danger : colors.primary)} !important;
`

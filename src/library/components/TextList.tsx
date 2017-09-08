import { observer } from "mobx-react"
import * as React from "react"
import styled from "styled-components"

import { AppStore } from "~/app/stores"

import { TextListElement } from "~/library/components"

export interface ITextListProps {
  readonly appStore: AppStore
}
export const TextList = observer(function _TextList({ appStore }: ITextListProps): JSX.Element {
  const texts = appStore.textStore.texts.values()
  return <Root>{texts.map(t => <TextListElement key={t.id} appStore={appStore} text={t} />)}</Root>
})

const Root = styled.ul`
  padding: 0 1rem 0 0;
  list-style-type: none;
  margin-top: -0.25rem;
`

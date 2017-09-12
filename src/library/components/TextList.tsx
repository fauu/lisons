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
  margin: 0;
  padding: 0 1rem 0 0;
  flex: 1;
  list-style-type: none;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 15px;
  }
  &::-webkit-scrollbar-track {
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.05);
  }
`

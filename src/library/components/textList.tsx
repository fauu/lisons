import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";

import { AppStore } from "~/app/stores";

import { TextListElement } from "~/library/components";

export interface TextListProps {
  readonly appStore: AppStore;
}
export const TextList = observer(function _TextList({ appStore }: TextListProps): JSX.Element {
  const entries = appStore.textStore.library.values();
  console.log(entries);
  return (
    <Root>
      {Array.from(entries).map(e => <TextListElement key={e.id} appStore={appStore} entry={e} />)}
    </Root>
  );
});

const Root = styled.div`
  position: relative;
  padding: 1rem 0;
  background: transparent;
  display: grid;
  grid-template-columns: 200px 200px 200px 200px;
  grid-gap: 40px;
  width: 100%;
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
`;

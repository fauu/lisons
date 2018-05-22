import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";

import { AppStore } from "~/app/stores";

import { TextListElement } from "~/library/components";

interface TextListProps {
  appStore: AppStore;
}
export const TextList = observer(function _TextList({ appStore }: TextListProps): JSX.Element {
  return (
    <Root>
      {[...appStore.textStore.indexIterator].map(t => (
        <TextListElement key={t.id} appStore={appStore} entry={t} />
      ))}
    </Root>
  );
});

const Root = styled.div`
  position: relative;
  padding: 1rem 2.5%;
  background: transparent;
  display: grid;
  grid-template-columns: repeat(4, [col] 22.75%);
  grid-gap: 3%;
  grid-auto-rows: min-content;
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

import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";

import { colors } from "~/app/data/style";
import { AppStore } from "~/app/stores";

import { TextListElement } from "~/library/components";

interface TextListProps {
  appStore: AppStore;
}
export const TextList = observer(function _TextList({ appStore }: TextListProps): JSX.Element {
  return (
    <Root>
      {appStore.textStore.allTextEntries.map(t => (
        <TextListElement key={t.id} appStore={appStore} entry={t} />
      ))}
    </Root>
  );
});

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  display: grid;
  grid-gap: 3rem;
  grid-template-columns: repeat(auto-fill, 12vw);
  grid-auto-rows: calc(12vw * 3 / 2);
  @media (min-width: 1800px) {
    grid-template-columns: repeat(auto-fill, 9.5vw);
    grid-auto-rows: calc(9.5vw * 3 / 2);
  }
  justify-content: space-around;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 15px;
  }
  &::-webkit-scrollbar-track {
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.primaryFade3};
  }
`;

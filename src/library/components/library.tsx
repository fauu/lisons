import { shell } from "electron";
import { BetaIcon } from "mdi-react";
import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";

import { animations, colors, sizes } from "~/app/data/style";
import { AppStore } from "~/app/stores";

import { AddTextDialog, TextList } from "~/library/components";

interface LibraryProps {
  appStore: AppStore;
}
export const Library = observer(function _Library({ appStore }: LibraryProps): JSX.Element {
  const isEmpty = appStore.textStore.isEmpty;
  const addTextDialogStore = appStore.libraryStore.addTextDialogStore;
  const { isNewVersionAvailable } = appStore;
  return (
    <Root>
      <LogoWrapper>
        <Logo>
          <LogoText>Lisons!</LogoText>
        </Logo>
        <BetaIndicator />
      </LogoWrapper>
      <Main>
        <ReadColumn>
          {isEmpty ? <span>Your library is empty.</span> : <TextList {...{ appStore }} />}
        </ReadColumn>
        <AddTextColumn>
          <ColumnHeader>Add text</ColumnHeader>
          <AddTextColumnContent>
            <AddTextDialog store={addTextDialogStore} />
          </AddTextColumnContent>
        </AddTextColumn>
      </Main>
      <VersionPanel>
        {isNewVersionAvailable && (
          <span>
            <NewVersionMessage onClick={() => shell.openExternal(AppStore.websiteUrl)}>
              New version available!
            </NewVersionMessage>
            <Separator />
          </span>
        )}
        <span>{VERSION}</span>
      </VersionPanel>
    </Root>
  );
});

const Root = styled.div`
  height: 100vh;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  background-color: ${colors.secondary};
`;

const LogoWrapper = styled.div`
  display: flex;
`;

const Logo = styled.div`
  padding: 0 1rem;
  align-self: flex-start;
  background-color: ${colors.accent};
  background-image: linear-gradient(90deg, #ff9a8b 0%, #ff6a88 55%, #ff99ac 100%);
  background-size: 300% 100%;
  border-radius: ${sizes.borderRadius};
  font-weight: bold;
  animation: ${animations.gradientRotate} 3s ease infinite;
`;

const LogoText = styled.span`
  display: inline-block;
  vertical-align: middle;
  font-size-adjust: 0.5;
  font-size: 6.5rem;
  letter-spacing: -2px;
  color: ${colors.secondary};
`;

const BetaIndicator = styled(BetaIcon)`
  fill: ${colors.primaryFade2};
`;

const Main = styled.div`
  margin-top: 2rem;
  display: flex;
  flex: 1;
  color: ${colors.primary};
`;

const ReadColumn = styled.div`
  flex: 3;
  animation: ${animations.fadeInBottom} ${animations.doubleTime};
`;

const AddTextColumn = styled.div`
  padding-left: 2.5rem;
  border-left: 2px solid ${colors.primary};
  flex: 2;
`;

const AddTextColumnContent = styled.div`
  animation: ${animations.fadeInBottom} ${animations.doubleTime};
`;

const ColumnHeader = styled.div`
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: bold;
`;

const VersionPanel = styled.div`
  position: absolute;
  right: 0.8rem;
  top: 0.7rem;
  font-size: 1.6rem;
  color: ${colors.primaryFade2};
`;

const NewVersionMessage = styled.span`
  text-decoration: underline;
  transition: color ${animations.std};
  &:hover {
    color: ${colors.accent2};
  }
`;

const Separator = styled.span`
  margin: 0 0.5rem;
  &::after {
    content: "·";
  }
`;

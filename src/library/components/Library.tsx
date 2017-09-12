import { observer } from "mobx-react"
import * as React from "react"
import styled from "styled-components"

import { animations, colors } from "~/app/data/Style"
import { BetaIcon } from "~/app/Icons"
import { AppStore } from "~/app/stores"

import { AddTextDialog, TextList } from "~/library/components"

export interface ILibraryProps {
  readonly appStore: AppStore
}
export const Library = observer(function _Library({ appStore }: ILibraryProps): JSX.Element {
  const isEmpty = appStore.textStore.texts.size === 0
  const addTextDialogStore = appStore.libraryStore.addTextDialogStore
  const settingsStore = appStore.settingsStore
  return (
    <Root>
      <LogoWrapper>
        <Logo>
          <LogoText>Lisons!</LogoText>
        </Logo>
        <BetaIndicator />
      </LogoWrapper>
      <Body>
        <ReadColumn>
          {isEmpty ? <span>Your library is empty.</span> : <TextList {...{ appStore }} />}
        </ReadColumn>
        <AddTextColumn>
          <ColumnHeader>Add text:</ColumnHeader>
          <AddTextColumnContent>
            <AddTextDialog {...{ addTextDialogStore, settingsStore }} />
          </AddTextColumnContent>
        </AddTextColumn>
      </Body>
      <VersionPanel>
        <VersionString>{VERSION}</VersionString>
      </VersionPanel>
    </Root>
  )
})

const Root = styled.div`
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  background-color: ${colors.secondary};
  height: 100%;
`

const LogoWrapper = styled.div`display: flex;`

const Logo = styled.h1`
  margin: 0;
  padding: 0 0.6rem;
  align-self: flex-start;
  background-color: ${colors.accent};
  background-image: linear-gradient(90deg, #ff9a8b 0%, #ff6a88 55%, #ff99ac 100%);
  background-size: 300% 100%;
  border-radius: 3px;
  animation: ${animations.gradientRotate} 3s ease infinite;
`

const LogoText = styled.span`
  display: inline-block;
  vertical-align: middle;
  font-size-adjust: 0.5;
  font-size: 2em;
  letter-spacing: -0.04em;
  color: ${colors.secondary};
`

const BetaIndicator = styled(BetaIcon)`fill: ${colors.primaryFade2};`

const Body = styled.div`
  margin-top: 2rem;
  display: flex;
  flex: 1;
  color: ${colors.primary};
  font-size: 1.3em;
`

const ReadColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 3;
  animation: ${animations.fadeInBottom} ${animations.doubleTime};
`

const AddTextColumn = styled.div`
  border-left: 2px solid ${colors.primary};
  padding-left: 2rem;
  flex: 2;
`

const AddTextColumnContent = styled.div`
  animation: ${animations.fadeInBottom} ${animations.doubleTime};
`

const ColumnHeader = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 0.9em;
`

const VersionPanel = styled.div`
  position: absolute;
  right: 0.8rem;
  top: 0.8rem;
`

const VersionString = styled.span`color: ${colors.primaryFade2};`

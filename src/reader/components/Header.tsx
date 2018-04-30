import {
  ArrowCollapseRightIcon,
  ArrowExpandLeftIcon,
  CloseIcon,
  FormatFontIcon,
  FullscreenExitIcon,
  FullscreenIcon,
  MenuDownIcon
} from "mdi-react"
import { observer } from "mobx-react"
import * as React from "react"
import styled from "styled-components"

import { animations } from "~/app/data/Style"
import { AppStore } from "~/app/stores"
import { withProps } from "~/util/StyleUtils"

import { HeaderButton } from "~/reader/components"
import { UiColorVariant } from "~/reader/model"

export interface IHeaderProps {
  readonly appStore: AppStore
  readonly variant: UiColorVariant
}
export const Header = observer(function _Header({
  appStore,
  variant
}: IHeaderProps): JSX.Element | null {
  const readerStore = appStore.readerStore
  const sidebarStore = readerStore.sidebarStore
  const text = readerStore.text
  if (!text) {
    return null
  }
  const { currentSection, toggleTocVisible } = readerStore
  return (
    <Root variant={variant}>
      <TextTitle>{text.title}</TextTitle>
      {currentSection && (
        <SectionInfo onClick={toggleTocVisible} variant={variant}>
          <SectionName>{currentSection.name}</SectionName>
          <MenuDownIcon />
        </SectionInfo>
      )}
      <Actions variant={variant}>
        {sidebarStore.isVisible ? (
          <HeaderButton
            tip={"Hide sidebar"}
            Icon={ArrowCollapseRightIcon}
            onClick={sidebarStore.hide}
          />
        ) : (
          <HeaderButton
            tip={"Show sidebar"}
            Icon={ArrowExpandLeftIcon}
            onClick={sidebarStore.setVisible}
          />
        )}
        <HeaderButton
          tip={"Customize look"}
          Icon={FormatFontIcon}
          onClick={sidebarStore.toggleSettings}
        />
        {appStore.isFullScreen ? (
          <HeaderButton
            tip={"Exit fullscreen mode"}
            Icon={FullscreenExitIcon}
            onClick={appStore.toggleFullScreen.bind(appStore)}
          />
        ) : (
          <HeaderButton
            tip={"Enter fullscreen mode"}
            Icon={FullscreenIcon}
            onClick={appStore.toggleFullScreen.bind(appStore)}
          />
        )}
        <HeaderButton
          tip={"Exit to library"}
          Icon={CloseIcon}
          onClick={appStore.showLibraryScreen.bind(appStore)}
        />
      </Actions>
    </Root>
  )
})

const Root = withProps<{ variant: UiColorVariant }>()(styled.div)`
  color: ${p => (p.variant === "Light" ? "#ffffffaa" : "#000000aa")};
  display: flex;
  align-items: center;
  height: 2.25rem;
  font-size: 1.2rem;
  background: ${p => (p.variant === "Light" ? "#ffffff11" : "#00000011")};
  width: 100%;
  position: relative;
  letter-spacing: -0.03em;
`

const TextTitle = styled.span`
  flex: 1;
  padding-right: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 0.7rem;
  font-weight: bold;
  font-size: 0.95em;
`

const SectionInfo = withProps<{ variant: UiColorVariant }>()(styled.div)`
  flex: 1;
  padding-left: 1rem;
  margin-right: 0.4rem;
  font-size: 0.85em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  max-width: 40%;
  &:hover {
    * {
      fill-opacity: 1;
      opacity: 1;
    }
  }
  > .mdi-icon {
    fill-opacity: 0.8;
    fill: ${p => (p.variant === "Light" ? "#ffffffaa" : "#000000aa")};
    transition: opacity ${animations.std};
  }
`

const SectionName = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  max-width: 100%;
  opacity: 0.8;
  transition: opacity ${animations.std};
`

const Actions = withProps<{ variant: UiColorVariant }>()(styled.div)`
  display: flex;
  background: ${p => (p.variant === "Light" ? "#ffffff09" : "#00000009")};
  height: 100%;
  align-items: center;
  padding: 0 0.5rem;
`

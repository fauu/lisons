import { computed } from "mobx"
import { observer } from "mobx-react"
import * as React from "react"
import styled from "styled-components"

import { animations } from "~/app/data/Style"
import { ChevronLeftIcon, ChevronRightIcon, SkipBackwardIcon, SkipForwardIcon } from "~/app/Icons"
import { IReaderStyleSettings } from "~/app/model"
import { AppStore, SettingsStore } from "~/app/stores"
import { formatPercentage } from "~/util/FormatUtils"
import { hexToRgb, isColorDark, withProps } from "~/util/StyleUtils"

import { Header, Sidebar, Toc } from "~/reader/components"
import { UiColorVariant } from "~/reader/model"
import { ReaderStore, SidebarStore } from "~/reader/stores"

import * as noiseTexture from "~/res/images/noise-texture.png"

export interface IReaderProps {
  readonly appStore: AppStore
}
@observer
export class Reader extends React.Component<IReaderProps> {
  private appStore: AppStore
  private settingsStore: SettingsStore
  private readerStore: ReaderStore
  private sidebarStore: SidebarStore

  public componentWillMount(): void {
    this.appStore = this.props.appStore
    this.settingsStore = this.appStore.settingsStore
    this.readerStore = this.appStore.readerStore
    this.sidebarStore = this.readerStore.sidebarStore
  }

  public componentWillUnmount(): void {
    this.sidebarStore.setResourcesNotLoading()
    this.readerStore.clear()
  }

  public componentDidMount(): void {
    this.readerStore.initTextView().attach("text-view")
    this.readerStore.scrollText("LastKnownPosition")
  }

  @computed
  private get uiColorVariant(): UiColorVariant {
    return isColorDark(hexToRgb(this.settingsStore.settings.readerStyle.background))
      ? "Light"
      : "Dark"
  }

  private handleTocAnyClick = () => {
    this.readerStore.setTocVisible(false)
  }

  private handleTocSectionLinkClick = (startElementNo: number) => {
    this.readerStore.scrollText(startElementNo)
  }

  public render(): JSX.Element | null {
    const readerStore = this.readerStore
    const text = readerStore.text
    if (!text) {
      return null
    }
    const {
      currentSection,
      isTocOpen,
      readingProgress,
      isFirstPage,
      isLastPage,
      showPrevPage,
      showNextPage
    } = readerStore
    const userStyle = this.settingsStore.settings.readerStyle
    const variant = this.uiColorVariant
    const isOnlyPage = isFirstPage && isLastPage
    const isRtl = text!.isRtl
    return (
      <Root>
        <Body
          userStyle={userStyle}
          animateSelection={this.sidebarStore.isMainTranslationLoading}
          isContentRtl={isRtl}
          areTranslationsRtl={text!.areTranslationsRtl}
        >
          <Header appStore={this.appStore} variant={variant} />
          {readingProgress && !isOnlyPage && this.renderTextProgress()}
          <TextWithNavigation>
            {isTocOpen && (
              <Toc
                sections={text!.structure!}
                currentSection={currentSection!}
                variant={variant}
                onAnyClick={this.handleTocAnyClick}
                onSectionLinkClick={this.handleTocSectionLinkClick}
              />
            )}
            <PrevPageButton
              visible={isRtl ? !isLastPage : !isFirstPage}
              onClick={isRtl ? showNextPage : showPrevPage}
              variant={variant}
            >
              <ChevronLeftIcon />
            </PrevPageButton>
            <div id="text-view" />
            <NextPageButton
              visible={isRtl ? !isFirstPage : !isLastPage}
              onClick={isRtl ? showPrevPage : showNextPage}
              variant={variant}
            >
              <ChevronRightIcon />
            </NextPageButton>
          </TextWithNavigation>
        </Body>
        {this.sidebarStore.isVisible && (
          <Sidebar sidebarStore={this.sidebarStore} settingsStore={this.settingsStore} />
        )}
      </Root>
    )
  }

  private renderTextProgress(): JSX.Element | null {
    const {
      text,
      readingProgress,
      isFirstPage,
      isLastPage,
      skipBackward,
      skipForward
    } = this.readerStore
    const variant = this.uiColorVariant
    const isRtl = text!.isRtl
    const showLeftButton = (isRtl && !isLastPage) || (!isRtl && !isFirstPage)
    const showRightButton = (isRtl && !isFirstPage) || (!isRtl && !isLastPage)
    return (
      <TextProgress variant={variant}>
        <SecondaryTextNavButtonWrapper left>
          {showLeftButton && (
            <SkipBackwardButton onClick={isRtl ? skipForward : skipBackward} variant={variant} />
          )}
        </SecondaryTextNavButtonWrapper>
        <ProgressWrapper>
          {readingProgress instanceof Array ? (
            readingProgress.map(val => formatPercentage(val)).join(" – ")
          ) : (
            formatPercentage(readingProgress!)
          )}
        </ProgressWrapper>
        <SecondaryTextNavButtonWrapper>
          {showRightButton && (
            <SkipForwardButton onClick={isRtl ? skipBackward : skipForward} variant={variant} />
          )}
        </SecondaryTextNavButtonWrapper>
      </TextProgress>
    )
  }
}

const Root = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
`

interface ITextAreaProps {
  readonly userStyle: IReaderStyleSettings
  readonly animateSelection: boolean
  readonly isContentRtl: boolean
  readonly areTranslationsRtl: boolean
}
const Body = withProps<ITextAreaProps>()(styled.div)`
  position: relative;
  flex: 1;
  z-index: 2;
  box-shadow: 0 0 10px 0 #000;
  background: ${p => p.userStyle.background};
  color: ${p => p.userStyle.textColor};
  overflow: hidden;
  transition: all ${animations.std};

  #text-view {
    height: calc(100vh - 2.25rem - 3rem);
    font-size: ${p => p.userStyle.fontSize}em;
    letter-spacing: ${p => p.userStyle.letterSpacing}em;
    font-family: ${p => p.userStyle.fontFamily};
    text-align: ${p => (p.isContentRtl ? "right" : p.userStyle.textAlign)};
    direction: ${p => (p.isContentRtl ? "rtl" : "ltr")};
    width: ${p => p.userStyle.width}rem;
    column-width: ${p => p.userStyle.width}rem;
    line-height: ${p => p.userStyle.lineHeight}em;
    overflow: hidden;
    user-select: none;
    opacity: 0;
    transition: all ${animations.std};
    > p {
      margin: calc(${p => p.userStyle.lineHeight}em / 2) 0;
    }
    .selected {
      background-color: ${p => p.userStyle.selectionColor};
      ${p => (p.animateSelection ? `animation: ${animations.halfFade} 1s infinite;` : "")}
    }
    [data-translation]:before {
      position: absolute;
      margin-top: -1.3em;
      background: ${p => p.userStyle.translationBgColor}88;
      border: 1px solid ${p => p.userStyle.translationBgColor}44;
      border-radius: 3px;
      backdrop-filter: blur(15px);
      background-image: url('${noiseTexture}');
      color: ${p => p.userStyle.translationTextColor};
      padding: 0.14em 0.3em;
      line-height: 1em;
      content: attr(data-translation);
      transition: all ${animations.std};
      direction: ${p => (p.areTranslationsRtl ? "rtl" : "ltr")}
    }
  }
`

const TextWithNavigation = styled.div`
  display: flex;
  position: relative;
`

interface ITextNavButtonProps {
  readonly visible: boolean
  readonly variant: UiColorVariant
}
const TextNavButton = withProps<ITextNavButtonProps>()(styled.div)`
  visibility: ${p => (p.visible ? "visible" : "hidden")};
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background ${animations.std};
  &:hover {
    background: ${p => (p.variant === "Light" ? "#ffffff05" : "#00000005")};
    > .mdi-icon {
      opacity: 1;
    }
  }
  > .mdi-icon {
    opacity: 0.5;
    fill: ${p => (p.variant === "Light" ? "#ffffff66" : "#00000066")};
    transition: all ${animations.std};
    transform: scale(2);
  }
`

const PrevPageButton = TextNavButton.extend`margin-right: 1em;`

const NextPageButton = TextNavButton.extend`margin-left: 1em;`

const TextProgress = withProps<{ variant: UiColorVariant }>()(styled.div)`
  position: absolute;
  height: 3rem;
  width: 100%;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
  color: ${p => (p.variant === "Light" ? "#ffffffaa" : "#000000aa")};
  z-index: 5;
`

const ProgressWrapper = styled.div`padding: 0 1.25rem;`

const SecondaryTextNavButtonWrapper = withProps<{ left?: boolean }>()(styled.div)`
  flex: 1;
  display: flex;
  align-items: center;
  ${p => (p.left ? "justify-content: flex-end" : "")}
`

const SecondaryTextNavButton = withProps<{ variant: UiColorVariant; onClick: any }>()(styled.div)`
  transform: scale(1.3);
  opacity: 0.5;
  fill: ${p => (p.variant === "Light" ? "#ffffff66" : "#00000066")};
  transition: opacity ${animations.std};
  &:hover {
    opacity: 1;
  }
  &:not(:last-child) {
    margin-right: 0.6rem;
  }
`
const SkipBackwardButton = SecondaryTextNavButton.withComponent(SkipBackwardIcon)
const SkipForwardButton = SecondaryTextNavButton.withComponent(SkipForwardIcon)

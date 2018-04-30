// TODO:
//   - Migrate components away from componentWillMount:
//     https://github.com/mobxjs/mobx-react/issues/447

import { configure } from "mobx"
import { observer } from "mobx-react"
import * as React from "react"
import { hot } from "react-hot-loader"
import styled from "styled-components"

import { Library } from "~/library/components"
import { Reader } from "~/reader/components"

import { FadeTransition, Spinner } from "~/app/components"
import { KeyCode } from "~/app/data/KeyCode"
import { animations, colors, fonts } from "~/app/data/Style"
import "~/app/GlobalCss.ts"
import { AppScreen } from "~/app/model"
import { AppStore } from "~/app/stores"

configure({ computedRequiresReaction: true, enforceActions: true })

@hot(module)
@observer
export class App extends React.Component<{}> {
  private appStore!: AppStore

  public componentWillMount(): void {
    this.appStore = new AppStore()
    document.addEventListener("keydown", this.handleKeyDown)
  }

  public componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKeyDown)
  }

  public render(): JSX.Element {
    return (
      <Wrapper id="app">
        <FadeTransition>{this.renderScreen(this.appStore.activeScreen)}</FadeTransition>
      </Wrapper>
    )
  }

  private renderScreen(screen?: AppScreen): JSX.Element {
    switch (screen) {
      case "Library":
        return <Library appStore={this.appStore} key={screen} />
      case "Reader":
        return <Reader appStore={this.appStore} key={screen} />
      default:
        return (
          <LoadingScreen key={"loading"}>
            <Spinner color={"Light"} />}
          </LoadingScreen>
        )
    }
  }

  // TODO: Keyboard-driven actions should share handlers with
  //       the corresponding mouse-driven actions
  private handleKeyDown = (e: KeyboardEvent): void => {
    const appStore = this.appStore
    const readerStore = appStore.readerStore
    const sidebarStore = readerStore.sidebarStore
    const inReader = this.appStore.activeScreen === "Reader"
    switch (e.keyCode) {
      case KeyCode.LeftArrow:
        if (inReader) {
          if (e.altKey) {
            readerStore.skipBackward()
          } else {
            readerStore.showPrevPage()
          }
        }
        break
      case KeyCode.RightArrow:
        if (inReader) {
          if (e.altKey) {
            readerStore.skipForward()
          } else {
            readerStore.showNextPage()
          }
        }
        break
      case KeyCode.B:
        if (e.ctrlKey && inReader) {
          sidebarStore.setVisible(!sidebarStore.isVisible)
        }
        break
      case KeyCode.Escape:
        if (inReader) {
          appStore.showLibraryScreen()
        }
        break
      case KeyCode.F11:
        appStore.toggleFullScreen()
        break
    }
  }
}

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${colors.primary};
  font: 0.95em ${fonts.ui};
  letter-spacing: -0.01em;
  overflow: hidden;
  -webkit-user-select: none;
  -webkit-app-region: drag;

  * {
    box-sizing: border-box;
  }

  /* FadeTransition hack */
  > div {
    display: block;
    height: 100%;
    > span {
      display: block;
      height: 100%;
    }
  }

  .fade-wait-leave {
    opacity: 1;
  }
  .fade-wait-leave.fade-wait-leave-active {
    opacity: 0;
    transition: opacity ${animations.std};
  }
  .fade-wait-enter {
    opacity: 0;
    pointer-events: none;
  }
  .fade-wait-enter.fade-wait-enter-active {
    opacity: 1;
    transition: opacity ${animations.stdTime} ease-in ${animations.stdTime};
  }
  /* .fade-wait-height {
    transition: height ${animations.stdTime} ease-in-out;
  } */

  :not(input):not(textarea),
  :not(input):not(textarea):hover,
  :not(input):not(textarea)::after,
  :not(input):not(textarea)::before {
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
  }
  input:focus,
  button:focus,
  textarea:focus {
    outline: none;
  }
`

const LoadingScreen = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

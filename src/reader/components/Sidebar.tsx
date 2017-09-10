import { observer } from "mobx-react"
import * as React from "react"
import styled from "styled-components"

import { FadeTransition, Spinner } from "~/app/components"
import { animations, colors } from "~/app/data/Style"
import { SettingsStore } from "~/app/stores"

import { Dictionary, ExampleSentenceList, Settings } from "~/reader/components"
import { SidebarStore } from "~/reader/stores"

import * as noiseTexture from "~/res/images/noise-texture.png"

export interface ISidebarProps {
  readonly sidebarStore: SidebarStore
  readonly settingsStore: SettingsStore
}
export const Sidebar = observer(function _Sidebar({
  sidebarStore,
  settingsStore
}: ISidebarProps): JSX.Element {
  const {
    dictionaryEntries,
    dictionaryEntriesState,
    exampleSentences,
    exampleSentencesState,
    isSettingsTabActive,
    sources
  } = sidebarStore
  const notLoading =
    dictionaryEntriesState === "NotLoading" && exampleSentencesState === "NotLoading"
  const hasDictionaryEntries = dictionaryEntriesState === "Loaded" && dictionaryEntries.length > 0
  const dictinaryLoading = dictionaryEntriesState === "Loading"
  const sentencesLoading = exampleSentencesState === "Loading"
  const sentencesLoaded = exampleSentencesState === "Loaded"
  const hasSentences = exampleSentences.length > 0
  return (
    <Root>
      <FadeTransition>
        {isSettingsTabActive ? (
          <Settings sidebarStore={sidebarStore} settingsStore={settingsStore} key={"settings"} />
        ) : (
          <Translations key={"translations"}>
            {notLoading && (
              <IdleContent>
                <Message>Select text to show translations</Message>
                <Sources>
                  <Source>
                    Main translation: <SourceName>{sources.translationSource}</SourceName>
                  </Source>
                  <Source>
                    Dictionary: <SourceName>{sources.dictionarySource}</SourceName>
                  </Source>
                  <Source>
                    Example sentences: <SourceName>{sources.sentencesSource}</SourceName>
                  </Source>
                </Sources>
              </IdleContent>
            )}
            {hasDictionaryEntries && <Dictionary entries={dictionaryEntries} />}
            {!notLoading && (
              <ExampleSentencesWrapper>
                {sentencesLoading && <Spinner color={"Light"} />}
                {sentencesLoaded &&
                  !dictinaryLoading &&
                  (!hasSentences ? (
                    <Message>No relevant sentences found</Message>
                  ) : (
                    <ExampleSentenceList sentences={exampleSentences} />
                  ))}
              </ExampleSentencesWrapper>
            )}
          </Translations>
        )}
      </FadeTransition>
    </Root>
  )
})

const Root = styled.div`
  width: 35vw;
  font-size: 1.4em;
  background: ${colors.primary};
  color: ${colors.secondary};
  background-image: url('${noiseTexture}');
  /* FadeTransition */
  > span {
    display: block;
    height: 100%;
    > span {
      display: block;
      height: 100%;
    }
  }
`

const Translations = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const IdleContent = styled.div`
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: ${animations.fadeIn} ${animations.std};
`

const Message = styled.span`
  color: #888;
  margin: auto;
`

const Sources = styled.ul`
  position: absolute;
  bottom: 0;
  width: 100%;
  margin-bottom: 1.25rem;
  padding-left: 2rem;
  list-style-type: none;
  font-size: 0.7em;
  color: #666;
`

const Source = styled.li``

const SourceName = styled.span`
  font-weight: bold;
  font-size: 1.1em;
`

const ExampleSentencesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  flex: 1;
  overflow: hidden;
`

import { shell } from "electron"
import * as React from "react"
import styled from "styled-components"

import { animations, colors } from "~/app/data/Style"
import { IExampleSentences, LanguageFlag } from "~/app/model"
import { withProps } from "~/util/StyleUtils"

export interface IExampleSentenceListProps {
  readonly sentences: IExampleSentences
}
export function ExampleSentenceList({ sentences }: IExampleSentenceListProps): JSX.Element {
  const sentencesRtl = (sentences.data[0].sentenceLanguage.flags & LanguageFlag.Rtl) > 0
  const translationsRtl = (sentences.data[0].translationsLanguage.flags & LanguageFlag.Rtl) > 0
  return (
    <Root>
      <SourceLink onClick={() => shell.openExternal(sentences.sourceUrl)}>
        View at <Domain>{sentences.sourceDomain}</Domain>
      </SourceLink>
      <List>
        {sentences.data.map((se, idx) => (
          <Element key={idx}>
            <Sentence dangerouslySetInnerHTML={{ __html: se.sentence }} rtl={sentencesRtl} />
            {se.translations[0].length > 0 && (
              <Translation rtl={translationsRtl}>{se.translations[0]}</Translation>
            )}
          </Element>
        ))}
      </List>
    </Root>
  )
}

const scrollbarWidth = "15px"

const Root = styled.div`
  margin: 0;
  padding: 1.25rem 2rem;
  font-size: 0.9em;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${animations.fadeIn} ${animations.doubleTime};
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: ${scrollbarWidth};
  }
  &::-webkit-scrollbar-track {
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
  }
`

const SourceLink = styled.span`
  position: absolute;
  bottom: 0;
  right: ${scrollbarWidth};
  padding: 0.3rem 0.45rem;
  border: 1px solid rgba(20, 20, 20, 0.15);
  border-bottom: none;
  background: rgba(20, 20, 20, 0.3);
  backdrop-filter: blur(15px);
  font-size: 0.9rem;
  color: ${colors.secondaryFade};
  transition: color ${animations.stdTime};
  &:hover {
    color: ${colors.secondary};
  }
`

const Domain = styled.span`font-weight: bold;`

const List = styled.ul`
  width: 100%;
  list-style-type: none;
  margin: 0 0 1.2rem 0;
  padding: 0;
`

const Element = styled.li`
  line-height: 1.2em;
  &:not(:first-child) {
    padding-top: 1rem;
  }
  &:not(:last-child) {
    padding-bottom: 1rem;
    border-bottom: 1px solid #333;
  }
  & em {
    font-style: normal;
    text-shadow: 1px 1px 0 ${colors.primary}, -1px 1px 0 ${colors.primary},
      2px 0 0 ${colors.primary}, -2px 0 0 ${colors.primary};
    box-shadow: inset 0 -1px 0 0 ${colors.primary}, inset 0 -3px 0 0 ${colors.secondaryFade};
  }
`

const Sentence = withProps<{ rtl: boolean }>()(styled.div)`
  font-weight: bold;
  ${p => (p.rtl ? "text-align: right;" : "")}
  ${p => (p.rtl ? "direction: rtl;" : "")}
`

const Translation = withProps<{ rtl: boolean }>()(styled.div)`
  margin-top: 0.5rem;
  color: ${colors.secondaryFade};
  ${p => (p.rtl ? "text-align: right;" : "")}
  ${p => (p.rtl ? "direction: rtl;" : "")}
`

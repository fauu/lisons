import * as React from "react"
import styled from "styled-components"

import { animations, colors } from "~/app/data/Style"
import { LanguageFlag } from "~/app/model"
import { ISentenceWithTranslations } from "~/app/Tatoeba"
import { withProps } from "~/util/StyleUtils"

export interface IExampleSentenceListProps {
  readonly sentences: ISentenceWithTranslations[]
}
export function ExampleSentenceList({ sentences }: IExampleSentenceListProps): JSX.Element {
  const sentencesRtl = (sentences[0].sentenceLanguage.flags & LanguageFlag.Rtl) > 0
  const translationsRtl = (sentences[0].translationsLanguage.flags & LanguageFlag.Rtl) > 0
  return (
    <Root>
      {sentences.map((se, idx) => (
        <Element key={idx}>
          <Sentence dangerouslySetInnerHTML={{ __html: se.sentence }} rtl={sentencesRtl} />
          {se.translations[0].length > 0 && (
            <Translation rtl={translationsRtl}>{se.translations[0]}</Translation>
          )}
        </Element>
      ))}
    </Root>
  )
}

const Root = styled.ul`
  margin: 0;
  padding: 1.25rem 2rem;
  font-size: 0.9em;
  list-style-type: none;
  flex: 1;
  animation: ${animations.fadeIn} 0.4s ease-out;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 15px;
  }
  &::-webkit-scrollbar-track {
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
  }
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
    border-bottom: 2px solid ${colors.secondary};
    font-style: normal;
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

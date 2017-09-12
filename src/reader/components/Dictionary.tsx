import * as React from "react"
import styled from "styled-components"

import { animations, colors, fonts } from "~/app/data/Style"

import { IDictionaryEntry } from "~/reader/model"

const variantCountLimit = 5

export interface IDictionaryProps {
  readonly entries: IDictionaryEntry[]
}
export function Dictionary({ entries }: IDictionaryProps): JSX.Element {
  return (
    <Root>
      {entries.map((e, idx) => {
        {
          /* const numNotShownVariants = e.variants.length - variantCountLimit; */
        }
        return (
          <Entry key={idx}>
            <EntryHeader>
              <Word>{e.word}</Word>
              <PartOfSpeech>{e.partOfSpeech}</PartOfSpeech>
            </EntryHeader>
            <EntryBody>
              {e.variants.slice(0, variantCountLimit).map((v, idxx) => {
                return (
                  <EntryVariant key={idxx}>
                    {v.translation}
                    <ReverseTranslations>({v.reverseTranslations.join(", ")})</ReverseTranslations>
                    {/* {numNotShownVariants > 0 &&
                      idxx === variantCountLimit - 1 &&
                      <NotAllVariantsMsg>
                        (…{numNotShownVariants} more)
                      </NotAllVariantsMsg>} */}
                  </EntryVariant>
                )
              })}
            </EntryBody>
          </Entry>
        )
      })}
    </Root>
  )
}

const Root = styled.div`
  padding: 0.75rem 0rem 1.25rem 2rem;
  background: ${colors.secondary};
  color: ${colors.primary};
  overflow-x: hidden;
  overflow-y: scroll;
  box-shadow: 0 0 10px 0 #000;
  z-index: 1;
  flex-shrink: 2;
  animation: ${animations.fadeInTop} ${animations.doubleTime};

  &::-webkit-scrollbar {
    width: 15px;
  }
  &::-webkit-scrollbar-track {
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
  }
`

const Entry = styled.article`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`

const EntryHeader = styled.header``

const Word = styled.span`
  font-weight: bold;
  font-style: italic;
  font-family: ${fonts.serif};
`

const PartOfSpeech = styled.span`
  color: ${colors.primaryFade};
  margin-left: 0.5rem;
  font-size: 0.7em;
`

const EntryBody = styled.ul`
  list-style-type: none;
  margin: 0.3rem 0 0 0;
  padding-left: 1em;
  font-size: 0.9em;
`

const EntryVariant = styled.li``

const ReverseTranslations = styled.span`
  margin-left: 0.5em;
  font-size: 0.7em;
  opacity: 0.6;
`

// const NotAllVariantsMsg = styled.span`
//   margin-left: 1rem;
//   font-size: 0.8em;
//   opacity: 0.8;
//   white-space: nowrap;
// `

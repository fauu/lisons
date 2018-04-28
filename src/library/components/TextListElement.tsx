import { ArrowRightIcon, DeleteIcon } from "mdi-react"
import * as React from "react"
import styled from "styled-components"

import { animations, colors, fonts } from "~/app/data/Style"
import { Text } from "~/app/model"
import { AppStore } from "~/app/stores"
import { formatPercentage } from "~/util/FormatUtils"
import { withProps } from "~/util/StyleUtils"

export interface ITextListElementProps {
  readonly appStore: AppStore
  readonly text: Text
}
export function TextListElement({ appStore, text }: ITextListElementProps): JSX.Element {
  const progress = text.progress && text.progress.percentage > 0 && text.progress.percentage
  return (
    <Root key={text.id}>
      <Primary>
        <TitleAndAuthor>
          <Title onClick={() => appStore.showReaderScreen(text.id)}>{text.title}</Title>
          {text.author && <Author>{text.author}</Author>}
        </TitleAndAuthor>
        <span className="actions">
          <DeleteButton onClick={() => appStore.textStore.delete(text.id)} />
        </span>
      </Primary>
      <Secondary>
        {progress && <Progress>{formatPercentage(progress)}</Progress>}
        <Languages>
          {text.contentLanguage.localName}
          <ArrowRightIcon />
          {text.translationLanguage.localName}
        </Languages>
      </Secondary>
    </Root>
  )
}

const Root = styled.li`
  position: relative;
  padding: 1rem 0 1rem 0.5rem;
  background: transparent;
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.primaryFade3}88;
  }
  &:first-child {
    border-top-right-radius: 3px;
  }
  &:last-child {
    border-bottom-right-radius: 3px;
  }
  .actions {
    opacity: 0;
  }
  &:hover {
    background: linear-gradient(
      to right,
      transparent 50%,
      ${colors.primaryFade3}55 90%,
      ${colors.primaryFade3}88 100%
    );
    .actions {
      opacity: 1;
    }
  }
`

const Primary = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const TitleAndAuthor = styled.div`
  display: flex;
  flex: 1;
  align-items: baseline;
  margin-bottom: 0.3rem;
  max-width: 40em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Title = styled.span`
  display: inline-block;
  max-width: 70%;
  height: 1.4em;
  margin-right: 0.7rem;
  font: bold 1.1em ${fonts.serif};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    text-shadow: 1px 1px 0 ${colors.secondary}, -1px 1px 0 ${colors.secondary},
      2px 0 0 ${colors.secondary}, -2px 0 0 ${colors.secondary};
    box-shadow: inset 0 -3px 0 0 ${colors.secondary}, inset 0 -5px 0 0 ${colors.accent2};
  }
`

const Author = styled.span`
  font-size: 0.8em;
  color: ${colors.primaryFade};
  max-width: 30%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Secondary = styled.div`
  margin-top: -0.2rem;
`

const Languages = styled.span`
  display: inline-flex;
  align-items: center;
  font-style: italic;
  font-size: 0.8em;
  color: ${colors.primaryFade};

  > .mdi-icon {
    margin: 0 0.1rem;
    transform: scale(0.7);
    fill: ${colors.primaryFade};
    fill-opacity: 0.8;
  }
`

// TODO: Rework without absolute positioning
const DeleteButton = withProps<{ onClick: () => void }>()(styled(DeleteIcon))`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 1rem;
  fill: ${colors.primaryFade};
  margin-left: 2rem;
  &:hover {
    fill: ${colors.danger};
    transition: fill ${animations.halfTime};
  }
`

const Progress = styled.span`
  display: inline;
  padding: 0.2rem 0.3rem;
  border-radius: 3px;
  font-size: 0.7em;
  color: ${colors.primaryFade};
  border: 1px solid ${colors.primaryFade};
  margin-right: 0.8rem;
`

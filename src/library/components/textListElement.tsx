// @ts-ignore
import { ArrowRightIcon, DeleteIcon } from "mdi-react";
import * as path from "path";
import * as React from "react";
import styled from "styled-components";

import * as noiseTexture from "~/res/images/noise-texture.png";

import { animations, colors, fonts } from "~/app/data/style";
import { LibraryEntry } from "~/app/model";
import { AppStore } from "~/app/stores";
import { getUserDataPath } from "~/util/fileUtils";
// @ts-ignore
import { formatPercentage } from "~/util/formatUtils";
import { withProps } from "~/util/styleUtils";

// TODO: Figure out how to handle this better
const userDataPath = getUserDataPath();

export interface TextListElementProps {
  readonly appStore: AppStore;
  readonly entry: LibraryEntry;
}
// @ts-ignore
// TODO: Rename to TextGridElement etc.
export function TextListElement({ appStore, entry }: TextListElementProps): JSX.Element {
  // @ts-ignore
  // const progress = text.progress && text.progress.percentage > 0 && text.progress.percentage;
  return (
    <Root key={entry.id}>
      <Cover coverPath={entry.coverPath && path.join(userDataPath, entry.coverPath)}>
        {!entry.coverPath && (
          <AuthorAndTitle>
            <Author>{entry.author}</Author>
            <Title>{entry.title}</Title>
          </AuthorAndTitle>
        )}
        <Bar>
          <Languages>
            {entry.contentLanguage}
            &rarr;
            {entry.translationLanguage}
          </Languages>
          <Actions>
            <DeleteButton onClick={() => appStore.textStore.deleteFromLibrary(entry.id)} />
          </Actions>
        </Bar>
      </Cover>
      {/* <Primary>
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
      </Secondary> */}
    </Root>
  );
}

const Root = styled.div`
  height: 300px;
  animation: ${animations.fadeInBottom} ${animations.doubleTime};
`;

const Cover = withProps<{ coverPath?: string }>()(styled.div)`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: ${colors.primaryFade3};
  background-image: ${p => (p.coverPath ? `url('file://${p.coverPath}')` : "none")};
  background-size: cover;

  > div:last-child {
    display: none;
  }

  &:hover {
    > div:last-child {
      display: initial;
    }
  }
`;

const AuthorAndTitle = styled.div`
  margin: 0 0.5rem;
  font-family: ${fonts.serif};
  font-size: 1em;
`;

const Author = styled.div``;

const Title = styled.div`
  margin-bottom: 0.1rem;
  font-weight: bold;
  font-size: 1.1em;
`;

const Bar = styled.div`
  position: absolute;
  bottom: 0;
  height: 30px;
  width: 100%;
  background: #22222255;
  backdrop-filter: blur(15px);
  background-image: url('${noiseTexture}');
  color: ${colors.secondary};
  line-height: 30px;
  display: flex;
  justify-content: space-between;
`;

const Languages = styled.span``;

const Actions = styled.span``;

const DeleteButton = withProps<{ onClick: () => void }>()(styled(DeleteIcon))`
  fill: ${colors.primary};
  &:hover {
    fill: ${colors.danger};
    transition: fill ${animations.halfTime};
  }
`;

// const Primary = styled.div`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// `;

// const TitleAndAuthor = styled.div`
//   display: flex;
//   flex: 1;
//   align-items: baseline;
//   margin-bottom: 0.3rem;
//   max-width: 40em;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
// `;

// const Title = styled.span`
//   display: inline-block;
//   max-width: 70%;
//   height: 1.4em;
//   margin-right: 0.7rem;
//   font: bold 1.1em ${fonts.serif};
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   &:hover {
//     text-shadow: 1px 1px 0 ${colors.secondary}, -1px 1px 0 ${colors.secondary},
//       2px 0 0 ${colors.secondary}, -2px 0 0 ${colors.secondary};
//     box-shadow: inset 0 -3px 0 0 ${colors.secondary}, inset 0 -5px 0 0 ${colors.accent2};
//   }
// `;

// const Author = styled.span`
//   font-size: 0.8em;
//   color: ${colors.primaryFade};
//   max-width: 30%;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
// `;

// const Secondary = styled.div`
//   margin-top: -0.2rem;
// `;

// const Languages = styled.span`
//   display: inline-flex;
//   align-items: center;
//   font-style: italic;
//   font-size: 0.8em;
//   color: ${colors.primaryFade};

//   > .mdi-icon {
//     margin: 0 0.1rem;
//     transform: scale(0.7);
//     fill: ${colors.primaryFade};
//     fill-opacity: 0.8;
//   }
// `;

// // TODO: Rework without absolute positioning
// const DeleteButton = withProps<{ onClick: () => void }>()(styled(DeleteIcon))`
//   position: absolute;
//   top: 50%;
//   transform: translateY(-50%);
//   right: 1rem;
//   fill: ${colors.primaryFade};
//   margin-left: 2rem;
//   &:hover {
//     fill: ${colors.danger};
//     transition: fill ${animations.halfTime};
//   }
// `;

// const Progress = styled.span`
//   display: inline;
//   padding: 0.2rem 0.3rem;
//   border-radius: 3px;
//   font-size: 0.7em;
//   color: ${colors.primaryFade};
//   border: 1px solid ${colors.primaryFade};
//   margin-right: 0.8rem;
// `;

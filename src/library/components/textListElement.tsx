import { ArrowRightIcon, DeleteIcon } from "mdi-react";
import * as path from "path";
import * as React from "react";
import styled from "styled-components";

import { animations, colors, fonts, sizes } from "~/app/data/style";
import { TextIndexEntry } from "~/app/model";
import { AppStore } from "~/app/stores";
import { getUserDataPath } from "~/util/fileUtils";
import { formatPercentage } from "~/util/formatUtils";

// TODO: Figure out how to handle this better
const userDataPath = getUserDataPath();

interface TextListElementProps {
  appStore: AppStore;
  entry: TextIndexEntry;
}

// TODO: Rename to TextGridElement etc.
export function TextListElement({ appStore, entry }: TextListElementProps): JSX.Element {
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
          <Progress>{formatPercentage(99, 0)}</Progress>
          <Languages>
            {entry.contentLanguage}
            <ArrowRight />
            {entry.translationLanguage}
          </Languages>
          <Actions>
            <DeleteButton onClick={() => appStore.textStore.deleteById(entry.id)} />
          </Actions>
        </Bar>
      </Cover>
    </Root>
  );
}

const Root = styled.div`
  height: 300px;
  animation: ${animations.fadeInBottom} ${animations.doubleTime};
  border: 2px solid ${colors.primary};
  border-radius: ${sizes.borderRadius};

  transition: all 0.05s ${animations.stdFunction};

  &:hover:not(:disabled) {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transform: translate(0, -1px);
    border-color: ${colors.accent};
  }
`;

const Cover = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: ${colors.primaryFade3};
  background-image: ${(p: { coverPath?: string }) =>
    p.coverPath ? `url('file://${p.coverPath}')` : "none"};
  background-size: cover;

  > div:last-child {
    display: none;
  }

  &:hover {
    > div:last-child {
      display: flex;
    }
  }
`;

const AuthorAndTitle = styled.div`
  margin: 0 1rem;
  font-family: ${fonts.serif};
`;

const Author = styled.div`
  margin-bottom: 0.2rem;
`;

const Title = styled.div`
  font-weight: bold;
`;

const Bar = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0.4rem 0.8rem;
  background: ${colors.secondary};
  color: ${colors.primary};
  border-top: 2px solid ${colors.accent};
  display: flex;
  justify-content: space-between;
  font-size: 1.6rem;
  font-weight: bold;

  .mdi-icon {
    fill: ${colors.primary};
  }
`;

const Progress = styled.span`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const Languages = styled.span`
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const ArrowRight = styled(ArrowRightIcon)`
  width: 24px;
  padding: 2px 3px 0 3px;
`;

const Actions = styled.span`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const DeleteButton = styled<any, any>(DeleteIcon)`
  width: 20px;
  &:hover {
    fill: ${colors.danger};
    transition: fill ${animations.halfTime};
  }
`;

import * as React from "react"
import styled from "styled-components"

import { animations } from "~/app/data/Style"
import { ITextSectionInfo } from "~/app/model"
import { withProps } from "~/util/StyleUtils"

import { UiColorVariant } from "~/reader/model"

export interface ITocProps {
  readonly sections: ITextSectionInfo[]
  readonly currentSection: ITextSectionInfo
  readonly variant: UiColorVariant
  readonly onAnyClick: () => void
  readonly onSectionLinkClick: (startElementNo: number) => void
}
export function Toc({
  sections,
  currentSection,
  variant,
  onAnyClick,
  onSectionLinkClick
}: ITocProps): JSX.Element {
  return (
    <Root onClick={onAnyClick}>
      <Wrapper variant={variant}>
        <SectionList variant={variant}>
          {sections.map(s => (
            <SectionLink
              key={s.startElementNo}
              current={s.startElementNo === currentSection.startElementNo}
              onClick={() => onSectionLinkClick(s.startElementNo)}
            >
              {s.name}
            </SectionLink>
          ))}
        </SectionList>
      </Wrapper>
    </Root>
  )
}

const Root = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 1rem 1rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const Wrapper = withProps<{ variant: UiColorVariant }>()(styled.div)`
  z-index: 9001;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  background: transparent;
  animation: ${animations.fadeInTop} ${animations.std};
  font-size: 1.1em;
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: ${p => (p.variant === "Light" ? "#888888bb" : "#ccccccbb")};
  }
  &::-webkit-scrollbar-thumb {
    background: ${p => (p.variant === "Light" ? "#cccccc55" : "#88888855")};
  }
`

const SectionList = withProps<{ variant: UiColorVariant }>()(styled.ul)`
  margin: 0;
  padding: 0;
  list-style-type: none;
  color: ${p => (p.variant === "Light" ? "#f9f9f9" : "#333")};
  border: 1px solid ${p => (p.variant === "Light" ? "#ffffff17" : "#00000017")};
  background: ${p => (p.variant === "Light" ? "#22222255" : "#ffffff55")};
  backdrop-filter: blur(10px);
  background-image: url("../res/noise-texture.png");
  li:not(:last-child) {
    border-color: ${p => (p.variant === "Light" ? "#ffffff17" : "#00000017")};
  }
  li:hover {
    background: ${p => (p.variant === "Light" ? "#ffffff11" : "#ffffff66")};
  }
`

const SectionLink = withProps<{ current: boolean; onClick: any }>()(styled.li)`
  padding: 0.7rem;
  transition: background ${animations.std};
  ${p => (p.current ? "font-weight: bold;" : "")}
  &:not(:last-child) {
    border-bottom: 1px solid;
  }
`

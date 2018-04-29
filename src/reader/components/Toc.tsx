import * as React from "react"
import styled from "styled-components"

import { animations } from "~/app/data/Style"
import { ITextSectionInfo } from "~/app/model"
import { withProps } from "~/util/StyleUtils"

import { UiColorVariant } from "~/reader/model"

import * as noiseTexture from "~/res/images/noise-texture.png"

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
          {sections.map(s => {
            const isActive = s.startElementNo === currentSection.startElementNo
            return (
              <SectionLink
                key={s.startElementNo}
                isActive={isActive}
                variant={variant}
                onClick={!isActive ? () => onSectionLinkClick(s.startElementNo) : undefined}
              >
                {s.name}
              </SectionLink>
            )
          })}
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
  letter-spacing: -0.03em;
`

const Wrapper = withProps<{ variant: UiColorVariant }>()(styled.div)`
  z-index: 9001;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  background: transparent;
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
  backdrop-filter: blur(15px);
  background-image: url('${noiseTexture}');
`

const SectionLink = withProps<{ isActive: boolean; variant: UiColorVariant; onClick: any }>()(
  styled.li
)`
  min-width: 10rem;
  padding: 0.7rem;
  transition: background ${animations.std};
  ${p => (p.isActive ? "font-weight: bold;" : "")}
  ${p =>
    p.isActive
      ? "box-shadow: inset 0px 11px 8px -10px rgba(0, 0, 0, 0.16), inset 0px -11px 8px -10px rgba(0, 0, 0, 0.16);"
      : ""}
  background: ${p =>
    p.isActive ? (p.variant === "Light" ? "#ffffff11" : "#ffffff66") : "transparent"};
  &:hover {
    background: ${p => (p.variant === "Light" ? "#ffffff11" : "#ffffff66")};
  }
  &:not(:last-child) {
    border-bottom: 1px solid ${p => (p.variant === "Light" ? "#ffffff17" : "#00000017")};
  }
`

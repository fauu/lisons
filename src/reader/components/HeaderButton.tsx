import { debounce } from "lodash"
import { MdiReactIconComponentType } from "mdi-react"
import * as React from "react"
import styled from "styled-components"

import { withProps } from "~/util/StyleUtils"

import { UiColorVariantContext } from "~/reader/components"
import { UiColorVariant } from "~/reader/model"

export interface IHeaderButtonProps {
  readonly tip: string
  readonly Icon: MdiReactIconComponentType
  readonly onClick: () => void
}
export interface IHeaderButtonState {
  readonly isTipVisible: boolean
  readonly wasTipCancelled: boolean
}
export class HeaderButton extends React.Component<IHeaderButtonProps, IHeaderButtonState> {
  private static readonly tipDelayMs = 500

  public constructor(props: IHeaderButtonProps) {
    super(props)
    this.state = { isTipVisible: false, wasTipCancelled: false }
  }

  public render(): JSX.Element {
    return (
      <UiColorVariantContext.Consumer>
        {colorVariant => (
          <>
            <Button
              onClick={this.props.onClick}
              onMouseEnter={debounce(this.handleMouseEnter, HeaderButton.tipDelayMs)}
              onMouseLeave={this.handleMouseLeave}
              colorVariant={colorVariant}
            >
              <this.props.Icon />
            </Button>
            <Tip visible={this.state.isTipVisible}>{this.props.tip}</Tip>
          </>
        )}
      </UiColorVariantContext.Consumer>
    )
  }

  public shouldComponentUpdate(
    // TODO: update the rule to accept leading underscores?
    // tslint:disable-next-line
    _nextProps: IHeaderButtonProps,
    nextState: IHeaderButtonState
  ): boolean {
    return nextState.isTipVisible !== this.state.isTipVisible
  }

  private handleMouseEnter = () => {
    this.setState({ isTipVisible: !this.state.wasTipCancelled, wasTipCancelled: false })
  }

  private handleMouseLeave = () => {
    this.setState({ isTipVisible: false, wasTipCancelled: !this.state.isTipVisible })
  }
}

const Button = withProps<{ colorVariant: UiColorVariant }>()(styled.span)`
  &:not(:last-child) {
    margin-right: 0.6rem;
  }
  .mdi-icon {
    fill-opacity: 0.6;
    fill: ${p => (p.colorVariant === "Light" ? "#ffffffaa" : "#000000aa")};
    transition: fill-opacity 0.2s ease;
  }
  &:hover .mdi-icon {
    fill-opacity: 0.85;
  }
`

// TODO: DRY (translation tip)
const Tip = withProps<{ visible: boolean }>()(styled.span)`
  background-color: #000;
  color: #fff;
  position: absolute;
  margin-top: 2em;
  background: #22222288;
  border: 1px solid #22222244;
  border-radius: 3px;
  color: #fefefe;
  padding: 0.14em 0.3em;
  -webkit-transition: all 0.2s ease-out;
  display: ${p => (p.visible ? "initial" : "none")};
  pointer-events: none;
`

// @ts-ignore
import { debounce } from "lodash"
import * as React from "react"
// @ts-ignore
import styled from "styled-components"

import { withProps } from "~/util/StyleUtils"

export interface IHeaderButtonProps {
  readonly Icon: React.ComponentClass<any>
  readonly tip: string
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
      <>
        <Button
          onClick={this.props.onClick}
          onMouseOver={debounce(this.handleMouseOver, HeaderButton.tipDelayMs)}
          onMouseOut={this.handleMouseOut}
        >
          <this.props.Icon />
        </Button>
        <Tip visible={this.state.isTipVisible}>{this.props.tip}</Tip>
      </>
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

  private handleMouseOver = () => {
    console.log("mouse over")
    if (!this.state.wasTipCancelled) {
      this.setState({ isTipVisible: true })
    }
    this.setState({ wasTipCancelled: false })
  }

  private handleMouseOut = () => {
    console.log("mouse out")
    if (!this.state.isTipVisible) {
      this.setState({ wasTipCancelled: true })
    }
    this.setState({ isTipVisible: false })
  }
}

const Button = styled.span`
  * {
    pointer-events: none;
  }
`

// TODO: DRY (translation tip)
const Tip = withProps<{ visible: boolean }>()(styled.span)`
  background-color: #000;
  color: #fff;
  position: absolute;
  margin-top: 1.3em;
  background: #22222288;
  border: 1px solid #22222244;
  border-radius: 3px;
  -webkit-backdrop-filter: blur(15px);
  color: #fefefe;
  padding: 0.14em 0.3em;
  -webkit-transition: all 0.2s ease-out;
  display: ${p => (p.visible ? "initial" : "none")};
`

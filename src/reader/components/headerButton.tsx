import { debounce } from "lodash";
import { MdiReactIconComponentType } from "mdi-react";
import * as React from "react";
import styled from "styled-components";

import { sizes } from "~/app/data/style";

import { UiColorVariantContext } from "~/reader/components";
import { UiColorVariant } from "~/reader/model";

interface HeaderButtonProps {
  tip: string;
  Icon: MdiReactIconComponentType;
  onClick: () => void;
}
export interface HeaderButtonState {
  isTipVisible: boolean;
  wasTipCancelled: boolean;
}
export class HeaderButton extends React.Component<HeaderButtonProps, HeaderButtonState> {
  private static readonly tipDelayMs = 500;

  public constructor(props: HeaderButtonProps) {
    super(props);
    this.state = { isTipVisible: false, wasTipCancelled: false };
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
              variant={colorVariant}
            >
              <this.props.Icon />
            </Button>
            <Tip visible={this.state.isTipVisible}>{this.props.tip}</Tip>
          </>
        )}
      </UiColorVariantContext.Consumer>
    );
  }

  public shouldComponentUpdate(
    // TODO: update the rule to accept leading underscores?
    // tslint:disable-next-line
    _nextProps: HeaderButtonProps,
    nextState: HeaderButtonState
  ): boolean {
    return nextState.isTipVisible !== this.state.isTipVisible;
  }

  private handleMouseEnter = () => {
    this.setState({ isTipVisible: !this.state.wasTipCancelled, wasTipCancelled: false });
  };

  private handleMouseLeave = () => {
    this.setState({ isTipVisible: false, wasTipCancelled: !this.state.isTipVisible });
  };
}

const Button = styled.span`
  &:not(:last-child) {
    margin-right: 0.6rem;
  }
  .mdi-icon {
    fill-opacity: 0.6;
    fill: ${(p: { variant: UiColorVariant }) =>
      p.variant === "Light" ? "#ffffffaa" : "#000000aa"};
    transition: fill-opacity 0.2s ease;
  }
  &:hover .mdi-icon {
    fill-opacity: 0.85;
  }
`;

// TODO: DRY (translation tip)
const Tip = styled.span`
  background-color: #000;
  color: #fff;
  position: absolute;
  margin-top: 2em;
  background: #22222288;
  border: 1px solid #22222244;
  border-radius: ${sizes.borderRadius};
  color: #fefefe;
  padding: 0.14em 0.3em;
  transition: all 0.2s ease-out;
  display: ${(p: { visible: boolean }) => (p.visible ? "initial" : "none")};
  pointer-events: none;
`;

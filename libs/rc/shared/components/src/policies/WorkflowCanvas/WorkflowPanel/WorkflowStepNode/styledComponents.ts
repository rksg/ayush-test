import { Typography } from 'antd'
import styled, { createGlobalStyle } from 'styled-components/macro'

export const StepNode = styled.div<{ selected?: boolean }>`
  font-size: 12px;
  width: 220px;
  height: 64px;
  padding: 12px;
  cursor: pointer;

  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-30);

  ${props => props.selected
    ? `
    border-radius: 4px;
    border: 1px solid var(--acx-accents-orange-50);
    background-color: var(--acx-accents-orange-10);
    `
    : ''}

  :hover {
    border: 1px solid var(--acx-accents-orange-50);
  }

  // Hide the handler and adjust the position to
  // let the edge line can connect with each Nodes without space
  .react-flow__handle {
    opacity: 0;
  }
  .react-flow__handle-bottom {
    top: 58px;
  }
  .react-flow__handle-top {
    top:0;
  }
`

export const StartNode = styled(StepNode)`
  //display: none;

  border: 1px dashed  var(--acx-primary-black);

  div {
    text-align: center;
  }
`

export const ActionTypeIcon = styled.div`
  width: 40px;
  height: 40px;

  svg {
    width: 100%;
    height: 100%;
  }
`

export const FlagIcon = styled.div`
  position: absolute;
  top: -8px;
  left: -4px;

  background: black;
  border-radius: 50%;
  border: 1px solid var(--acx-primary-black) !important;

  width: 16px;
  height: 16px;

  svg {
    width: 100%;
    height: 100%;
  }
  path {
    stroke: white;
    fill: white;
  }
`

export const EditButton = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  border: 1px solid var(--acx-primary-black) !important;
  display: flex;
  align-items: center;
  justify-content: center;

  transform: rotate(90deg);

  :hover {
    cursor: pointer;
    border: 1px solid var(--acx-accents-orange-50) !important;
    background-color: var(--acx-accents-orange-10) !important;

    path {
      fill: var(--acx-accents-orange-50) !important;
    }
  }
`

export const PlusButton = styled.div`
  position: absolute;
  top: 79px;
  right: 102px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  border: 1px solid var(--acx-primary-black) !important;
  display: flex;
  align-items: center;
  justify-content: center;

  ::after {
    content: '';
    position: absolute;
    bottom: 14px;
    left: 50%;
    width: 1px;
    height: 16px;
    background-color: var(--acx-primary-black);
    transform: translateX(-50%);
  }

  :hover {
    cursor: pointer;
    border: 1px solid var(--acx-accents-orange-50) !important;
    background-color: var(--acx-accents-orange-10) !important;

    path {
      stroke: var(--acx-accents-orange-50) !important;
    }

    ::after {
      height: 17px;
      background-color: var(--acx-accents-orange-50);
    }
  }
`

export const PopoverTitle = styled(Typography.Text)`
  color: var(--acx-neutrals-40);
  font-size: var(--acx-body-4-font-size);
`

export const PopoverContent = styled(Typography.Text)`
  color: var(--acx-primary-white);
  font-size: var(--acx-body-3-font-size);
  padding-bottom: 20px;
`

// slightly modified from analytics 
// TODO: will this conflict with the version in analytics since it is global?
export const PopoverGlobalStyle = createGlobalStyle`
  .ant-popover {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    filter: drop-shadow(0px 4px 8px rgba(51, 51, 51, 0.08));

    &-arrow {

      &-content { 
        box-shadow: none; 
        background-color: var(--acx-primary-black);
        // Use linear gradient to mix box shadow of popover inner
        --antd-arrow-background-color: linear-gradient(
          to right bottom,
          fadeout(var(--acx-primary-black), 10%),
          var(--acx-primary-black)
        );
      }
    }
    &-inner {
      box-shadow: none;
      white-space: pre-line;
      min-width: 30px;
      min-height: 30px;
      max-height: 300px;
      overflow-y: hidden;
      color: var(--acx-primary-white);

      &-content {
        background-color: var(--acx-primary-black);
        border-radius: 4px;
        padding: 8px 8px;
        box-shadow: none;
        white-space: pre-line;
        min-width: 30px;
        min-height: 30px;
        color: var(--acx-primary-white);
      }

      > :last-child {
        margin-bottom: 0;
      }
    }

    ul {
      padding-inline-start: 15px;
    }
  }

  .ant-spin {
    &.ant-spin-sm {
      .ant-spin-dot {
        font-size: 12px;
      }
    }
  }
`

export const PopoverWrapper = styled.span`
  > span {
    text-decoration: dotted underline;
    :after {
      content: '';
      display: block;
    }
  }

`
import { Menu, Typography }      from 'antd'
import { Popover as AntPopover } from 'antd'
import styled                    from 'styled-components/macro'

export const DisconnectedBranchNode = styled.div<{ selected?: boolean }>`
  width: 100%;
  height: 100%;

  background-color: var(--acx-semantics-red-20);
  font-size: 12px;
  padding: 12px;
  cursor: pointer;

  border-radius: 4px;
  border: 1px solid var(--acx-semantics-red-70);

  :hover {
    background-color: var(--acx-semantics-red-30);
  }

  :selected {
    background-color: var(--acx-semantics-red-30);
  }
`

export const StepNode = styled.div<{ selected?: boolean, invalid?: boolean }>`
  background-color: var(--acx-primary-white);
  font-size: 12px;
  width: 220px;
  height: 64px;
  padding: 12px;
  cursor: pointer;

  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-30);

  :hover {
    border: 1px solid var(--acx-accents-orange-50);
  }

  ${props => props.invalid
    ? `
    border-radius: 4px;
    border: 1px solid var(--acx-semantics-red-70);
    background-color: var(--acx-semantics-red-10);
    :hover {
      border: 1px solid var(--acx-semantics-red-50);
    }
    `
    : ''}

  ${props => props.selected
    ? `
    border-radius: 4px;
    border: 1px solid var(--acx-accents-orange-50);
    background-color: var(--acx-accents-orange-10);
    `
    : ''}

  ${props => props.invalid && props.selected
    ? `
    border-radius: 4px;
    border: 1px solid var(--acx-semantics-red-50);
    background-color: var(--acx-semantics-red-10);
    :hover {
      border: 1px solid var(--acx-semantics-red-50);
    }
    `
    : ''}

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

export const FlagIcon = styled.div<{ offset?: boolean }>`
  position: absolute;
  top: -8px;

  ${props => props.offset
    ? 'left: 16px;'
    : 'left: -4px;'}

  background: var(--acx-primary-black);
  border-radius: 50%;
  border: 1px solid var(--acx-primary-black) !important;

  width: 16px;
  height: 16px;

  svg {
    width: 100%;
    height: 100%;
  }
`

export const InvalidIcon = styled.div`
  position: absolute;
  top: -8px;
  left: -4px;

  background: var(--acx-semantics-red-70);
  border-radius: 50%;
  border: 1px solid var(--acx-semantics-red-70) !important;

  width: 16px;
  height: 16px;

  svg {
    width: 100%;
    height: 100%;
    fill: var(--acx-semantics-red-70);
    path:nth-child(2) {
      fill: var(--acx-semantics-red-70);
      stroke: var(--acx-semantics-red-70);
    }
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

export const PlusButton = styled.div<{ disabled?: boolean }>`
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
    ${props => props.disabled
    ? 'cursor: not-allowed;'
    : 'cursor: pointer;'}
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

export const DisconnectedBranchPlusButton = styled.div<{ disabled?: boolean }>`
  position: absolute;
  top: -31px;
  right: 125px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  border: 1px solid var(--acx-primary-black) !important;
  display: flex;
  align-items: center;
  justify-content: center;

  ::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 50%;
    width: 1px;
    height: 16px;
    background-color: var(--acx-primary-black);
    transform: translateX(-50%);
  }

  :hover {
    ${props => props.disabled
    ? 'cursor: not-allowed;'
    : 'cursor: pointer;'}
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


export const EditorToolbarIcon = styled.div`
  display: flex;
  align-content: center;

  width: 20px;
  height: 20px;

  svg {
    width: 100%;
    height: 100%;
  }

  path {
    stroke: var(--acx-primary-white) !important;
  }

  :hover path {
    stroke: var(--acx-accents-orange-50) !important;
  }
`

// this styles the label of the popover
export const Popover = styled(AntPopover)`
    color: var(--acx-accents-blue-50);
    text-decoration: dotted underline;
    :after {
      content: '';
      display: block;
    }
  `
export const Spacer = styled.div`
  height: var(--acx-content-vertical-space);
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

export const DeleteMenu = styled(Menu)`
  .ant-menu-item:hover, .ant-menu-item-active {
    color: var(--acx-primary-white);
    background-color: var(--acx-neutrals-70);
  }

  .ant-menu-item {
      line-height: 2;
      height: auto;
      color: var(--acx-primary-white);
      padding: 0 0.5rem !important;
      margin: 0 !important;
      font-size: 12px;
  }

  padding-bottom: 0px !important;
  user-select: none;
`
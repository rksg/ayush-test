import styled from 'styled-components/macro'


import { Collapse as AntCollapse } from '@acx-ui/components'

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

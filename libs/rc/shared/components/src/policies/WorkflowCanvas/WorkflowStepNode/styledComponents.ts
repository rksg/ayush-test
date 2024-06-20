import styled from 'styled-components/macro'

import { Collapse as AntCollapse } from '@acx-ui/components'

export const StarterNode = styled.div`
  padding: 10px 20px;
  border-radius: 5px;
  border: 1px dashed #888;
  width: 150px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;

  .react-flow__handle {
    background: ${(props) => props.theme.primary};
    width: 10px;
    height: 7px;
    border-radius: 3px;
  }
`

export const StepNode = styled.div<{ selected?: boolean }>`
  width: 220px;
  height: 64px;
  padding: 12px;

  border-radius: 5px;
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

  .react-flow__handle {
    background: ${(props) => props.theme.primary};
    width: 10px;
    height: 7px;
    border-radius: 3px;
  }
`

export const SourceHandle = styled.div<{ selected?: boolean }>`
  .react-flow__handle
  ${(props) => props.selected
    ? `{
        background: black;
        width: 0px;
        min-width: 0px;
        height: 0px;
        bottom: 1px;
        margin-left: -11px;
      }`
    : `{

      }
    }`}
`

export const CustomDiv = styled.div`
  .circle {
    width: 20px;
    height: 20px;
    background-color: blue;
    border-radius: 50%; /* Makes the div a circle */
    position: relative;
  }

  .circle::before, .circle::after {
    content: '';
    position: absolute;
    background-color: white;
  }

  .circle::before {
    left: 50%;
    top: 5px; /* 3px from the top to make the line 14px tall */
    transform: translateX(-50%); /* Center the line horizontally */
    width: 2px; /* Thickness of the line */
    height: 10px; /* Height of the vertical line */
  }

  .circle::after {
    top: 50%;
    left: 5px; /* 3px from the left to make the line 14px wide */
    transform: translateY(-50%); /* Center the line vertically */
    width: 10px; /* Width of the horizontal line */
    height: 2px; /* Thickness of the line */
  }
`

export const TargetHandle = styled.div<{ selected?: boolean }>`
  .react-flow__handle
  ${(props) => props.selected
    ? `{
        background: black;
        width: 0px;
        min-width: 0px;
        height: 0px;
        top: -16px;
        margin-left: -11px;
      }`
    : `{

    }`}
`

export const Collapse = styled(AntCollapse)`
  grid-area: 1 / 1 / 1 / 1;

  .ant-collapse-item {
    flex: 1;

    > .ant-collapse-content > .ant-collapse-content-box {
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-top: 16px;
    }
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

  :hover {
    border: 1px solid var(--acx-accents-orange-50) !important;
    background-color: var(--acx-accents-orange-10) !important;

    path {
      stroke: var(--acx-accents-orange-50) !important;
    }
  }
`

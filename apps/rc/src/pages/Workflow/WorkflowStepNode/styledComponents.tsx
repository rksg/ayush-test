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

export const WorkflowNode = styled.div<{ selected?: boolean }>`
  padding: 10px 20px;
  border-radius: 5px;
  // background: ${(props) => props.theme.nodeBg};
  // color: ${(props) => props.theme.nodeColor};
  border: 1px solid ${(props) => props?.selected ? '#3F3F3FFF' : '#888'};
  width: 180px;

  .react-flow__handle {
    background: ${(props) => props.theme.primary};
    width: 10px;
    height: 7px;
    border-radius: 3px;
  }
`

export const EditHandle = styled.div`
  .react-flow__handle {
    background: black;
    width: 0px;
    min-width: 0px;
    height: 0px;
    right: 10px;
    top: -10px;
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


// export const Content = styled.div`
//   min-height: 43px;
// `
// export const Footer = styled.div`
//   margin-top: 24px;
//   display: grid;
//   grid-template-columns: 1fr;
// `
//
// export const FooterButtons = styled.div`
//   grid-area: 1 / 1 / 1 / 1;
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
// `

export const Collapse = styled(AntCollapse)`
  grid-area: 1 / 1 / 1 / 1;
  .ant-collapse-item {
    flex: 1;
    > .ant-collapse-content >.ant-collapse-content-box {
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-top: 16px;
    }
  }
`

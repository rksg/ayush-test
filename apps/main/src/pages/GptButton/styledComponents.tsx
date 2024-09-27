import { StepsForm } from '@ant-design/pro-form'
import {
  Button as AntButton,
  Modal,
  Steps
} from 'antd'
import styled from 'styled-components/macro'


const Button = styled(AntButton).attrs({ type: 'primary' })`
  &&& {
    background-color: var(--acx-neutrals-10);
    border: none;
    &:hover, &:focus {
      border-color: var(--acx-accents-orange-55);
      background-color: var(--acx-accents-orange-55);
    }
    > svg {
      width: 16px;
      height: 100%;
    }
  }
`

export const ButtonSolid = styled(Button)`
  > svg {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  &:hover, &:focus {
    > svg {
      stroke: var(--acx-accents-orange-55);
    }
  }
`

export const GptModal = styled(Modal)<{ titleType: string }>`
  .ant-modal-content {
    border-radius: 24px;
    .ant-modal-header{
      border-radius: 24px;

      ${(props) =>
        props.titleType === 'wizard' &&
        `
        display: flex;
        justify-content: center;
      `}

    }
    .ant-modal-footer{
      background: none;
      text-align: center;
    }
    .ant-modal-body {
      max-height: calc(80vh - 100px);
      overflow-y: auto;
      .ant-pro-steps-form-container {
        padding: '0px 20px';
      }
    }
  }
`

export const GptStep = styled(Steps)`
  .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-icon {
    background: #5496EA;
    border-color: #5496EA;
  }

  .ant-steps-item-icon {
    width: 20px;
    line-height: 20px;
    height: 20px;
    font-size: 10px;
    margin-left:0px;
    margin-right:0px;
  }

  .ant-steps-item-finish .ant-steps-item-icon {
    border-color:  #5496EA !important;
  }

  .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
    color:  #5496EA !important;
  }

  .ant-progress-circle-path{
    stroke: white !important;
  }

  .ant-progress-inner {
    width: 18px !important;
    height: 18px !important;
  }

  .ant-steps-item-icon {
    margin: 5px 5px 5px 0px;
  }

  .ant-progress.ant-progress-circle.ant-progress-status-success.ant-progress-show-info.ant-progress-default {
    top: -1px !important;
  }

  .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
    left: -5px !important;
    background-color: #5496EA !important;
    top: 15px !important;
  }

  .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
    left: -3px !important;
    top: 15px !important;
  }
  .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
    left: -5px !important;
    top: 15px !important;
  }

  .ant-steps-small.ant-steps-horizontal:not(.ant-steps-label-vertical) .ant-steps-item {
    padding: 0px !important;
  }

  .ant-steps-item.ant-steps-item-process.ant-steps-item-active {
    padding-left: 0px !important;
  }

  .ant-steps-item.ant-steps-item-wait  {
    padding-left: 0px !important;
  }
  .ant-steps-item.ant-steps-item-finish {
    padding-left: 0px !important;
  }

  .ant-steps-item-wait .ant-steps-item-icon {
    background-color: #C4C4C4;
    border-color: #C4C4C4;
     > .ant-steps-icon {
    color: white;
    }
  }
`


export const VirticalContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 180px);
  grid-template-rows: repeat(2, 150px);
  gap: 10px;
  justify-content: center;
  align-content: center;
`


export const VirticalBox = styled.div`
  display: flex;
  font-size: 24px;
  width: 180px;
  height: 150px;
  .typeCard {
    width: 180px;
    height: 150px;
    border-radius: 8px;
  }
`

export const GptStepsForm = styled(StepsForm)`
 button {
  position: absolute;
  right: 100px;
 }

`

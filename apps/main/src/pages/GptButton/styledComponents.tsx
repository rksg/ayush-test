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

export const GptModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 24px;
    .ant-modal-header{
      border-radius: 24px;

    }
    .ant-modal-footer{
      background: none;
      text-align: center;
    }
    .ant-modal-body {
      max-height: calc(80vh - 100px);
      overflow-y: auto;
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
  }

  .ant-progress-circle-path{
    stroke: #5496EA !important;
  }

  .ant-progress-inner {
    width: 25px !important;
    height: 25px !important;
  }

  .ant-steps-item-icon {
    margin: 5px;
  }

  .ant-progress .ant-progress-circle .ant-progress-status-success .ant-progress-show-info .ant-progress-default {
    top: -4px !important;
    right: -4px !important;
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

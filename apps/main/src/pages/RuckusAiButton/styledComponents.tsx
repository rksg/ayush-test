/* eslint-disable max-len */
import { StepsForm } from '@ant-design/pro-form'
import {
  Button as AntButton,
  Card,
  Modal,
  Steps
} from 'antd'
import Meta   from 'antd/lib/card/Meta'
import styled from 'styled-components/macro'


import RuckusAiBackground from './assets/RuckusAiBackground.svg'


const Button = styled(AntButton).attrs({ type: 'primary' })`
  &&& {
    background-color: var(--acx-neutrals-10);
    border: none;
    &:hover, &:focus {
      border-color: var(--acx-accents-orange-10);
      background-color: var(--acx-accents-orange-10);
    }
    > svg {
      width: 20px;
      height: 100%;
    }
  }
`

export const ButtonSolid = styled(Button)`
  > svg {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  &:hover {
    > svg {
      stroke: var(--acx-accents-orange-55);
    }
  }
`
export const AiButton = styled.div`
height: 36px;
margin: -4px;
cursor: pointer;
svg {
  opacity: 0.95;
  width: 38px;
  height: 38px;
}
&:hover {
  > svg {
    opacity: 1;
}
`

export const GptModal = styled(Modal)<{ titleType: string, needBackground: boolean }>`
  .ant-modal-content {
    border-radius: 24px;
    .ant-modal-header {
      border-radius: 24px;

      ${(props) =>
    props.titleType === 'wizard' &&
        `
        padding-bottom: 0px;
        display: flex;
        justify-content: center;
      `}
    }
    .ant-modal-footer {
      background: none;
      text-align: center;
    }
    .ant-modal-body {
      margin-top: -20px;
      margin-right: 20px;
      overflow-y: auto;
      ${(props) => props.titleType === 'wizard' && `
        margin-right: 0px;`}
      ${(props) => props.needBackground && `
        margin-right: 0px;
        overflow-y: unset !important;
        background-image: url(${RuckusAiBackground});
        background-size: cover;
        background-position: center center;
        border-radius: 24px;
      `}

      .ant-pro-steps-form-container {
        padding: '0px 20px';
      }

      .ant-pro-steps-form-step.ant-pro-steps-form-step-active {
        overflow-y: auto;
        min-height: 200px;
        max-height: calc(100vh - 250px);
        padding-right: 30px;
        margin-right: -35px;
        margin-bottom: 10px;
      }

      .ant-space.ant-space-horizontal.ant-space-align-center {
        display: flex;
        justify-content: center;
      }
    }
  }
`


export const GptStep = styled(Steps)`
  .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-icon {
    background: var(--acx-accents-blue-50);
    border-color: var(--acx-accents-blue-50);
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
    border-color:  var(--acx-accents-blue-50) !important;
  }

  .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
    color:  var(--acx-accents-blue-50) !important;
  }

  .ant-progress-circle-path{
    stroke: var(--acx-primary-white) !important;
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
    background-color: var(--acx-accents-blue-50) !important;
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

  .ant-steps-item.ant-steps-item-finish,
  .ant-steps-item.ant-steps-item-process.ant-steps-item-active,
  .ant-steps-item.ant-steps-item-wait  {
    padding-left: 0px !important;
  }

  .ant-steps-item-wait .ant-steps-item-icon {
    background-color: var(--acx-neutrals-40);
    border-color: var(--acx-neutrals-40);
     > .ant-steps-icon {
    color: var(--acx-primary-white);
    }
  }
`

export const VirticalContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 180px);
  grid-template-rows: repeat(2, 150px);
  gap: 20px;
  justify-content: center;
  align-content: center;
  margin-left: 20px;
`

export const VirticalBox = styled.div`
  display: flex;
  font-size: 24px;
  width: 180px;
  height: 150px;
  .typeCard {
    width: 180px;
    .ant-card {
      height: 150px;
      border-radius: 8px;
    }
  }
`

export const GptStepsForm = styled(StepsForm)`
 button {
  position: absolute;
  right: 100px;
 }
`

export const CongratContainer = styled.div`

  position: relative;
  margin-top: 80px;
  z-index: 1;
  display: grid;
  justify-items: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 250px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
`


export const CongrateTitle = styled.div`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-2-font-size);
  font-weight: var(--acx-headline-2-font-weight-bold);
`

export const CongratSubtitle = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
  color: var(--acx-primary-black);
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-headline-4-line-height);
  font-weight: var(--acx-headline-4-font-weight);
`

export const CongratBox = styled.div`
  bottom: 130px;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 292px;
  margin: 20px 0px;
  background: transparent;
`

export const CongratCard = styled(Card)`
  width: 723px;
  background-color: var(--acx-neutrals-15);
  border: 0;
  border-radius: 8px;
  height: 90px;
  background: #FFFFFFCC;
  height: 100%;
  border: 1px solid var(--acx-neutrals-25);
  .ant-card-body {
    padding-top: 15px;
  }
`

export const StyledList = styled.ul`
  row-gap: 8px;
  display: flex;
  margin-left: -15px;
  flex-direction: column;
`
export const PageTitle = styled.div`
  font-size: var(--acx-headline-3-font-size);
  font-weight: var(--acx-headline-3-font-weight);
  font-family: var(--acx-accent-brand-font);
  margin-bottom: 15px;
`
export const WelcomeCards = styled.div`
display: flex;
align-items: center;
.ant-card{
  width: 360px;
  margin: 15px 15px 90px 15px;
  height: 200px;
  background: #FFFFFFCC;
}
  .ant-card-body {
    padding: 30px 40px;
  }
`

export const WelcomeMeta = styled(Meta)`
  .ant-card-meta-avatar{
    width: 400px;
  }

  .ant-card-meta-title {
    font-family: var(--acx-accent-brand-font);
    font-weight: 600;
    font-size: 18px;
  }

  .ant-card-meta-description {
    font-family: var(--acx-neutral-brand-font);
    font-weight: var(--acx-headline-4-font-weight);
    font-size: var(--acx-headline-4-font-size);
    color: var(--acx-neutrals-60);
    line-height: 20px;
  }

  .card-title{
    font-weight: 700;
    display: flex;
    align-items: center;
    svg{
      margin-right: 10px;
    }
  }
`

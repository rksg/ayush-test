
import { Button, Col, Typography } from 'antd'
import styled, { css }             from 'styled-components/macro'

const stepCompletedStyle = css`
  .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon-dot {
    &::after {
      top: 1px;
      left: 1px;
      background-color: var(--acx-steps-form-steps-step-color);
    }
  }
`

export const Wrapper = styled.section<{ editMode?: boolean }>`
  --acx-steps-form-steps-container-max-width: 160px;
  --acx-steps-form-steps-title-color: var(--acx-primary-black);
  --acx-steps-form-steps-title-font-size: var(--acx-body-4-font-size);
  --acx-steps-form-steps-title-line-height: var(--acx-body-4-line-height);
  --acx-steps-form-steps-active-title-font-weight: 700;
  --acx-steps-form-steps-step-size: 12px;
  --acx-steps-form-steps-step-color: var(--acx-accents-orange-50);

  --acx-steps-form-form-title-font-size: var(--acx-headline-3-font-size);
  --acx-steps-form-form-title-font-weight: 500;
  --acx-steps-form-form-title-line-height: var(--acx-headline-3-line-height);
  --acx-steps-form-form-title-margin-bottom: 16px;

  --acx-steps-form-container-margin: 20px;

  --acx-steps-form-steps-container-margin:
    calc(
      var(--acx-steps-form-container-margin) +
      var(--acx-steps-form-form-title-line-height) +
      var(--acx-steps-form-form-title-margin-bottom) +
      2px
    )
    0
    var(--acx-steps-form-container-margin)
  ;

  .ant-pro-steps-form { position: relative; }
  .ant-pro-steps-form-step {
    margin-top: 0;
    display: block;
    position: relative;
    @media screen and (min-width: 768px) { // var(--acx-screen-md)
      position: initial;
      display: none;
      &.ant-pro-steps-form-step-active {
        display: block;
      }
    }
  }

  // resetting due to it causes extra space out of box
  .ant-descriptions-view table { table-layout: initial; }

  // customize Steps component
  .ant-steps-dot {
    .ant-steps-item {
      .ant-steps-item-title {
        padding: 0 0 var(--acx-steps-form-steps-title-line-height) 12px;
        line-height: var(--acx-steps-form-steps-title-line-height);
        font-size: var(--acx-steps-form-steps-title-font-size);
      }
      &.ant-steps-item-active .ant-steps-item-title {
        font-weight: var(--acx-steps-form-steps-active-title-font-weight);
      }
      .ant-steps-item-title,
      &.ant-steps-item-wait .ant-steps-item-title {
        color: var(--acx-steps-form-steps-title-color);
      }

      .ant-steps-item-container {
        .ant-steps-item-tail {
          top: 2px;
          left: unset;
          width: var(--acx-steps-form-steps-step-size);
          padding: 11px 0 0;

          &::after {
            margin: 0 auto;
            display: block;
            ${props => !props.editMode ? css`
              background-color: var(--acx-steps-form-steps-step-color);
            ` : css`
              display: none;
            `}
          }
        }

        .ant-steps-item-content {
          min-height: calc(var(--acx-body-4-line-height) * 2);
        }
      }


      .ant-steps-item-icon {
        width: var(--acx-steps-form-steps-step-size);
        height: var(--acx-steps-form-steps-step-size);
        top: unset;
        margin-top: 3px;
        margin-right: 0px;

        .ant-steps-icon-dot {
          width: var(--acx-steps-form-steps-step-size);
          height: var(--acx-steps-form-steps-step-size);
          border: 1px solid var(--acx-steps-form-steps-step-color);
          background-color: transparent;
          top: unset;
          left: unset;

          &::after {
            top: 0;
            left: 0;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: transparent;
            transition-property: top, left, background-color;
          }
        }
      }
      &.ant-steps-item-active .ant-steps-item-icon .ant-steps-icon-dot {
        top: unset;
        left: unset;
        &::after {
          width: 10px;
          height: 10px;
          background-color: var(--acx-steps-form-steps-step-color);
        }
      }
      &.ant-steps-item-finish {
        ${stepCompletedStyle}
      }
      ${props => props.editMode ? css`
        &.ant-steps-item-wait  {
          ${stepCompletedStyle}
        }
      ` : ''}
    }
  }
`

export const Title = styled(Typography.Title).attrs({ level: 3 })`
  margin-bottom: 12px;
  font-size: var(--acx-subtitle-3-font-size);
  line-height: var(--acx-subtitle-3-line-height);
  font-weight: 400;
  @media screen and (min-width: 768px) { // var(--acx-screen-md)
    font-size: var(--acx-steps-form-form-title-font-size);
    line-height: var(--acx-steps-form-form-title-line-height);
    font-weight: var(--acx-steps-form-form-title-font-weight);
    margin-bottom: var(--acx-steps-form-form-title-margin-bottom);
  }
`

export const StepsContainer = styled.div`
  display: none;
  @media screen and (min-width: 768px) { // var(--acx-screen-md)
    display: block;
    margin: var(--acx-steps-form-steps-container-margin);
    width: 100%;
    max-width: var(--acx-steps-form-steps-container-max-width);
  }
`

export const ActionsContainer = styled.div`
  @media screen and (min-width: 768px) { // var(--acx-screen-md)
    position: absolute;
    top: 0;
    right: var(--acx-steps-form-container-margin);
    margin: var(--acx-steps-form-container-margin) var(--acx-steps-form-container-margin);
  }
`

export const Container = styled.div`
  .ant-pro-steps-form-container {
    margin: unset;
    margin: var(--acx-steps-form-container-margin);
    min-width: unset;
    flex: 1;
  }

  @media screen and (min-width: 768px) { // var(--acx-screen-md)
    display: flex;
  }
`

export const FormContainer = styled(Col)<{ $state: 'active' | 'finish' | 'wait' }>`
  ${props => props.$state === 'wait' ? css`
    > * { display: none; }
    > .ant-typography:first-child { display: block; }
    > .ant-row:not(.ant-form-item) {
      display: block;
      .ant-col > * { display: none; }
      .ant-col:first-child > .ant-typography { display: block; }
    }
  ` : ''}
`

export const EditButton = styled(Button)`
  margin-top: -10px;
  margin-left: -15px;
  @media screen and (min-width: 768px){ // var(--acx-screen-md)
    display: none;
  }
`

const stepSizes = {
  active: '12px',
  finish: '8px',
  wait: '0px'
}
export const StepIndicator = styled.div<{ state: 'active' | 'finish' | 'wait' }>`
  width: 1px;
  top: 4px;
  left: -12px;
  position: absolute;
  &::before, &::after {
    content: '';
    display: block;
    position: absolute;
    border-radius: 50%;
  }
  &::before {
    width: 12px;
    height: 12px;
    border: 1px solid var(--acx-accents-orange-50);
    left: -6px;
  }
  &::after {
    --size: ${props => stepSizes[props.state]};
    width: var(--size);
    height: var(--size);
    background-color: var(--acx-accents-orange-50);
    left: calc(var(--size) / -2);
    top: ${props => props.state === 'finish' ? '2px' : '0'};
  }
  @media screen and (min-width: 768px){ // var(--acx-screen-md)
    display: none;
  }
`

export const StepLine = styled.div`
  width: 1px;
  top: 16px;
  left: -12px;
  bottom: -4px;
  background-color: var(--acx-accents-orange-50);
  position: absolute;
  @media screen and (min-width: 768px){ // var(--acx-screen-md)
    display: none;
  }
`

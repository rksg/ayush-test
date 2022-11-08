import styled, { css } from 'styled-components/macro'

const buttonStyle = css`
  color: var(--acx-primary-black);
  background-color: transparent;
  border: none;
  box-shadow: none;
  border-radius: 20px;
  &:not(:first-child)::before {
    display: none;
  }
  &-checked {
    color: var(--acx-primary-white);
    background-color: var(--acx-primary-black);
  }
  span:nth-child(2) {
    vertical-align: middle;
    display: flex;
    align-items: center;
  }
`

export const Wrapper = styled.div`
  .ant-radio-group {
    border-radius: 20px;
    background-color: var(--acx-neutrals-20);
    vertical-align: top;
  }
  .ant-radio-button-wrapper {
    ${buttonStyle}

    &:not(.ant-radio-button-wrapper-checked, .ant-radio-button-wrapper-disabled):hover {
      background-color: var(--acx-neutrals-30);
    }
  }

  svg {
    vertical-align: middle;
    margin-right: 8px;
  }
  path { stroke: var(--acx-primary-black); }

  .ant-radio-button-wrapper-checked path {
    stroke: var(--acx-primary-white);
  }

  .ant-radio-button-wrapper-checked {
    cursor: default;
    &:not(.ant-radio-button-wrapper-disabled):hover {
      color: var(--acx-primary-white);
    }
  }

  .ant-radio-group-small {
    svg {
      width: var(--acx-body-4-font-size);
      height: var(--acx-body-4-font-size);
    }
    .ant-radio-button-wrapper {
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      height: 24px;
      span:nth-child(2) {
        margin: 4px 16px;
      }
    }
  }
  .ant-radio-group-large {
    svg {
      width: var(--acx-body-3-font-size);
      height: var(--acx-body-3-font-size);
    }
    .ant-radio-button-wrapper {
      font-size: var(--acx-body-3-font-size);
      line-height: var(--acx-body-3-line-height);
      height: 28px;
      span:nth-child(2) {
        margin: 4px 32px;
      }
    }
  }
`

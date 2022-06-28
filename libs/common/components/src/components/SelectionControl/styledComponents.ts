import styled, { css } from 'styled-components/macro'

const buttonStype = css`
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
    ${buttonStype}
  }

  svg {
    vertical-align: middle;
    margin-right: 8px;
  }
  path { stroke: var(--acx-primary-black); }
  .ant-radio-button-wrapper-checked path { stroke: var(--acx-primary-white); }

  .ant-radio-group-small {
    svg {
      width: var(--acx-body-5-font-size);
      height: var(--acx-body-5-font-size);
    }
    .ant-radio-button-wrapper {
      font-size: var(--acx-body-5-font-size);
      line-height: var(--acx-body-5-line-height);
      height: 16px;
      span:nth-child(2) {
        margin: 0px 10px;
      }
    }
  }
  .ant-radio-group-middle {
    svg {
      width: var(--acx-body-4-font-size);
      height: var(--acx-body-4-font-size);
    }
    .ant-radio-button-wrapper {
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      height: 24px;
      span:nth-child(2) {
        margin: 4px 8px;
      }
    }
  }
  .ant-radio-group-large {
    svg {
      width: var(--acx-body-2-font-size);
      height: var(--acx-body-2-font-size);
    }
    .ant-radio-button-wrapper {
      font-size: var(--acx-body-2-font-size);
      line-height: var(--acx-body-2-line-height);
      height: 32px;
      span:nth-child(2) {
        margin: 6px 10px;
      }
    }
  }
`

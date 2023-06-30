import { css } from 'styled-components/macro'

export const OTPDrawerStyle = css`
  .ant-drawer-body > form {
    padding-top: var(--acx-modal-footer-small-button-space);
  }

  .ant-radio-wrapper-in-form-item {
    margin-bottom: var(--acx-content-vertical-space);

    &.ant-radio-wrapper-checked {
      margin-bottom: 0px;
    }
  }

  .ant-radio-wrapper .ant-typography + .ant-form-item{
    margin-top: 10px;
  }

  .ant-radio-wrapper-in-form-item {
    input {
      width: 210px;
    }
  }
`
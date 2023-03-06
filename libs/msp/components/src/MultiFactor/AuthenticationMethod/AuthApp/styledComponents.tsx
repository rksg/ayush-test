import { Space }       from 'antd'
import styled, { css } from 'styled-components/macro'

export const AuthAppDrawerStyle = css`
  .ant-drawer-body > form {
    padding-top: var(--acx-modal-footer-small-button-space);
  }

  span.ant-typography {
    font-size: var(--acx-body-4-font-size);
  }

  .ant-typography.hasTooltip {
    border-bottom: 1px dotted grey;
  }

  .ant-typography ol li {
    margin-top: 13px;
  }

  span.ant-typography + .ant-form-item {
    margin-top: 10px;

    input {
      width: 210px;
    }
  }
`

export const QRCodeImgWrapper = styled(Space)`
  padding: 20px 0 10px;

  & img {
    width: 135px;
  }
`

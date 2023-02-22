import { Space }       from 'antd'
import styled, { css } from 'styled-components/macro'

export const PrefixIconWrapper = styled.span`
  span[role="img"] {
    margin-right: 8px;
  }
`
export const OtpLabel = styled(Space).attrs({ direction: 'vertical', size: 0 })`
  margin-bottom: 16px;
  .ant-space-item:last-of-type {
    color: var(--acx-neutrals-60);
    font-size: var(--acx-body-5-font-size);
  }
`
const linkStyle = css`
  color:var(--acx-accents-blue-50);
  cursor:pointer;
  margin-bottom:10px;
  &:hover{
    color:var(--acx-accents-blue-50);
  }
`
export const FieldTextLink = styled.div`
  ${linkStyle}
`

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: ${props => props.width} 1fr;
  align-items: baseline;
`
export const FieldLabel2 = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: ${props => props.width} 43px 70px;
  align-items: baseline;
`

export const QRCodeImgWrapper = styled(Space)`
  padding: 20px 0 10px;

  & img {
    width: 135px;
  }
`

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

export const RecoveryCodesDrawerStyle = css`
  .ant-drawer-body > div.ant-space {
    padding-top: var(--acx-modal-footer-small-button-space);
  }
`
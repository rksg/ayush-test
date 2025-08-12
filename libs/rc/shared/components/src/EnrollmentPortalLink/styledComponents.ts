import styled from 'styled-components/macro'

import { ChatbotLink, QrCodeSmallIcon } from '@acx-ui/icons'


export const StyledChatbotLink = styled(ChatbotLink)`
  width: unset !important;
  height: unset !important;
path {
    stroke:none !important;
    fill: var(--acx-accents-blue-50) !important;
  }
`

export const StyledQRLink = styled(QrCodeSmallIcon)`
  width: unset !important;
  height: unset !important;
path {
    stroke: none !important;
    fill: var(--acx-accents-blue-50) !important;
  }
`

export const QRCodeModalStyle = `
  .qr-code-modal .ant-modal-title,
  div.qr-code-modal .ant-modal-header .ant-modal-title,
  .ant-modal-wrap .qr-code-modal .ant-modal-title {
    font-size: 16px !important;
  }

  .qr-code-modal .ant-btn-primary,
  div.qr-code-modal .ant-modal-footer .ant-btn-primary,
  .ant-modal-wrap .qr-code-modal .ant-btn-primary {
    width: 240px !important;
    margin: 0 auto !important;
    display: block !important;
    background-color: white !important;
    color: black !important;
    border-color: black !important;
  }
`

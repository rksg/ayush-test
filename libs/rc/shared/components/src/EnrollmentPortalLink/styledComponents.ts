import styled from 'styled-components/macro'

import { Modal }                        from '@acx-ui/components'
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

export const StyledQRCodeModal = styled(Modal)`
  .ant-modal-title {
    font-size: 16px !important;
  }

  .ant-modal-footer {
    background-color: white !important;
  }

  .ant-modal-content {
    border-radius: 4px;
  }

  .ant-btn-primary {
    width: 240px !important;
    margin: 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    background-color: white !important;
    color: black !important;
    border-color: black !important;
  }

  .ant-btn-primary .anticon {
    color: black !important;
  }

  .ant-btn-primary svg {
    fill: black !important;
    color: black !important;
    stroke: black !important;
  }

  .ant-btn-primary svg * {
    fill: black !important;
    color: black !important;
    stroke: black !important;
  }
`

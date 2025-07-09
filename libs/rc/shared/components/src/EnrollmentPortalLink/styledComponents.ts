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

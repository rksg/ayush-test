/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import  { ccd80211ReasonCodes } from './ccd80211ReasonCodeMap'
// reference for available codes:
// https://github.com/rksg/rsa-mlisa-etl/blob/develop/etl/src/main/scala/com/ruckuswireless/mlisa/constants/MLISAConstants.scala
// but text is specific to UI
export const clientEvents = [
  {
    id: 201,
    code: 'EVENT_CLIENT_JOIN',
    text: defineMessage({ defaultMessage: 'Client join' })
  },
  {
    id: 236,
    code: 'EVENT_CLIENT_INFO_UPDATED',
    text: defineMessage({ defaultMessage: 'Client associated (802.11)' })
  },
  {
    id: 204,
    code: 'EVENT_CLIENT_DISCONNECT',
    text: defineMessage({ defaultMessage: 'Client disconnected' })
  },
  {
    id: 209,
    code: 'EVENT_CLIENT_ROAMING',
    text: defineMessage({ defaultMessage: 'Client roamed' })
  },
  {
    ...ccd80211ReasonCodes.find(reason => reason.code === 'SG_DHCP_CCD_REASON_DISASSOC_STA_HAS_LEFT'),
    id: -1
  },
  {
    ...ccd80211ReasonCodes.find(reason => reason.code === 'SG_DHCP_CCD_REASON_DEAUTH_LEAVING'),
    id: -2
  }
]

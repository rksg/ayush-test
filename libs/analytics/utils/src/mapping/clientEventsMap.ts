/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { ClientEventEnum } from '../types/clientEvent'

import { ccd80211ReasonCodes }    from './ccd80211ReasonCodeMap'
import { disconnectClientEvents } from './clientDisconnectEventsMap'

// reference for available codes:
// https://github.com/rksg/rsa-mlisa-etl/blob/develop/etl/src/main/scala/com/ruckuswireless/mlisa/constants/MLISAConstants.scala
// but text is specific to UI
export const clientEvents = [
  ...disconnectClientEvents,
  {
    id: 202,
    code: ClientEventEnum.JOIN,
    text: defineMessage({ defaultMessage: 'Client join' })
  },
  {
    id: 209,
    code: ClientEventEnum.ROAM,
    text: defineMessage({ defaultMessage: 'Client roamed' })
  },
  {
    id: 236,
    code: ClientEventEnum.INFO_UPDATED,
    text: defineMessage({ defaultMessage: 'Client associated (802.11)' })
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
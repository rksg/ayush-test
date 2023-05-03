/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { ClientEventEnum } from '../types/clientEvent'

const disconnects = [
  {
    id: 204,
    code: ClientEventEnum.DISCONNECT,
    text: defineMessage({ defaultMessage: 'Client disconnected' }),
    reason: defineMessage({ defaultMessage: 'This event occurs when the client disconnects from WLAN on AP' })
  },
  {
    id: 205,
    code: ClientEventEnum.INACTIVITY_TIMEOUT,
    text: defineMessage({ defaultMessage: 'Client connection timed out' }),
    reason: defineMessage({ defaultMessage: 'Client session terminated by the AP due to client inactivity timeout' })
  },
  {
    id: 208,
    code: ClientEventEnum.SESSION_EXPIRED,
    text: defineMessage({ defaultMessage: 'Client session expired' }),
    reason: defineMessage({ defaultMessage: 'Client session expired due to session timeout' })
  },
  {
    id: 210,
    code: ClientEventEnum.LOGGED_OUT,
    text: defineMessage({ defaultMessage: 'Client logged out' }),
    reason: defineMessage({ defaultMessage: 'This event occurs when a client session is logged out' })
  },
  {
    id: 218,
    code: ClientEventEnum.ROAMING_DISCONNECTED,
    text: defineMessage({ defaultMessage: 'Client roaming disconnected' }),
    reason: defineMessage({ defaultMessage: 'This event occurs when the client disconnects from the WLAN due to a smart roam policy' })
  }
]

const isolatedDisconnects = [
  {
    id: 201,
    code: ClientEventEnum.AUTHENTICATION_FAILURE,
    text: defineMessage({ defaultMessage: 'Client authentication failed' }),
    reason: defineMessage({ defaultMessage: 'Client encountered authentication failure' })
  },
  {
    id: 219,
    code: ClientEventEnum.BLOCKED,
    text: defineMessage({ defaultMessage: 'Client blocked' }),
    reason: defineMessage({ defaultMessage: 'Client blocked due to policy' })
  },
  {
    id: 225,
    code: ClientEventEnum.FORCE_DHCP_DISCONNECTED,
    text: defineMessage({ defaultMessage: 'Force DHCP disconnected' }),
    reason: defineMessage({ defaultMessage: 'Client disconnected by AP due to lack DHCP activity' })
  },
  {
    id: 228,
    code: ClientEventEnum.BLOCKED_BY_BARING,
    text: defineMessage({ defaultMessage: 'Client is blocked because of barring UE rule' }),
    reason: defineMessage({ defaultMessage: 'This event occurs when a client is temporally blocked by the UE barring rule' })
  }
]

export const disconnectClientEvents = [
  ...disconnects,
  ...isolatedDisconnects
]
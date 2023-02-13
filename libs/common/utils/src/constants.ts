import { defineMessage } from 'react-intl'

export const notAvailableMsg = defineMessage({
  defaultMessage: 'Not available in this Beta version'
})

export const directedMulticastInfo = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'When Directed Multicast is enabled, the AP inspects multicast traffic and monitors client IGMP/MLD subscriptions to determine packet handling. For multicast data subscribed to by the AP’s wireless clients, the AP will convert packets to unicast. When no client is subscribed, the AP will drop the packets. Some well-known traffic types (Bonjour, uPnP, etc) will bypass this logic altogether, and multicast-to-unicast conversion will be determined by the “Directed Threshold” in the WLAN advanced settings.'
})

export const TABLE_DEFAULT_PAGE_SIZE = 10
import { defineMessage } from 'react-intl'

export const directedMulticastInfo = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'When Directed Multicast is enabled, the AP inspects multicast traffic and monitors client IGMP/MLD subscriptions to determine packet handling. For multicast data subscribed to by the AP’s wireless clients, the AP will convert packets to unicast. When no client is subscribed, the AP will drop the packets. Some well-known traffic types (Bonjour, uPnP, etc) will bypass this logic altogether, and multicast-to-unicast conversion will be determined by the “Directed Threshold” in the WLAN advanced settings.'
})

export const exportMessageMapping = {
  EXPORT_TO_CSV: defineMessage({ defaultMessage: 'Export to CSV' })
}

export const TABLE_DEFAULT_PAGE_SIZE = 10
export const TABLE_MAX_PAGE_SIZE = 10000 // RC API limit (Elasticsearch setting)

export const noDataDisplay = '--' as const

export const TABLE_QUERY_POLLING_INTERVAL = 30_000
export const TABLE_QUERY_LONG_POLLING_INTERVAL = 300_000

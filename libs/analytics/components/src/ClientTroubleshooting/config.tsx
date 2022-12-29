import { defineMessage, IntlShape } from 'react-intl'

import {
  categoryOptions,
  mapCodeToFailureText,
  clientEventDescription,
  getConnectionQualityFor,
  takeWorseQuality
} from '@acx-ui/analytics/utils'
import { formatter } from '@acx-ui/utils'


import { ConnectionEvent, ConnectionQuality } from './services'

export const SUCCESS = 'success'
export const SLOW = 'slow'
export const DISCONNECT = 'disconnect'
export const INFO_UPDATED = 'info-updated'
export const JOIN = 'join'
export const ROAMED = 'roamed'
export const DISCONNECTED = 'disconnected'
export const FAILURE = 'failure'
export const INCIDENT = 'incident'
export const RADIO2DOT4G = '2.4'
export const RADIO5G = '5'
export const RADIO65G = '6(5)'
export const EAPOLMessageIds = ['21', '22', '23', '24']
export const filterEventMap = {
  [JOIN]: 'EVENT_CLIENT_JOIN',
  [INFO_UPDATED]: 'EVENT_CLIENT_INFO_UPDATED',
  [ROAMED]: 'EVENT_CLIENT_ROAMING',
  [DISCONNECTED]: 'EVENT_CLIENT_DISCONNECT',
  [FAILURE]: 'FAILURE',
  [RADIO2DOT4G]: '2.4',
  [RADIO5G]: '5',
  [RADIO65G]: '6(5)'
}
export const EVENT_STATES = {
  NORMAL: 'normal',
  JOIN: 'join',
  REASSOC: 're-associate',
  SPURIOUS_DISCONNECT: 'spurious-disconnect',
  SPURIOUS_INFO_UPDATED: 'spurious-info-updated'
}

export const TYPES = {
  CONNECTION_EVENTS: 'connectionEvents',
  ROAMING: 'roaming',
  CONNECTION_QUALITY: 'connectionQuality',
  NETWORK_INCIDENTS: 'networkIncidents'
}
// In RA these events are hidden
export const spuriousEvents = [
  EVENT_STATES.JOIN,
  EVENT_STATES.SPURIOUS_DISCONNECT,
  EVENT_STATES.SPURIOUS_INFO_UPDATED
]

export type DisplayEvent = ConnectionEvent & {
  start: number,
  end: number,
  code: string | null,
  apName: string,
  mac: string,
  radio: string,
  state: string,
  event: string,
  category: string
}
export const eventColorByCategory = {
  [DISCONNECT]: '--acx-neutrals-50',
  [SUCCESS]: '--acx-semantics-green-50',
  [FAILURE]: '--acx-semantics-red-50',
  [SLOW]: '--acx-semantics-yellow-50'
}
export const categorizeEvent = (name: string, ttc: number | null) => {
  const successEvents = [INFO_UPDATED, JOIN, ROAMED].map(
    key => filterEventMap[key as keyof typeof filterEventMap]
  )
  if (name === 'EVENT_CLIENT_DISCONNECT') return DISCONNECT
  if (!successEvents.includes(name)) return FAILURE
  if (ttc !== null && ttc >= 4000) return SLOW
  return SUCCESS
}
// common utility for history and connection events chart
export const transformEvents = (
  events: ConnectionEvent[], selectedEventTypes: string[], selectedRadios: string[]
) => events.reduce((acc, data, index) => {
  const { event, state, timestamp, mac, ttc, radio, code, failedMsgId, ssid } = data
  if (code === 'eap' && failedMsgId && EAPOLMessageIds.includes(failedMsgId)) {
    data = { ...data, code: 'eapol' }
  }

  const category = categorizeEvent(event, ttc)
  const eventType = category === 'failure' ? filterEventMap[FAILURE] : event

  const filterEventTypes = selectedEventTypes.map(
    e => filterEventMap[e as keyof typeof filterEventMap]
  )
  const filterRadios = selectedRadios.map(
    e => filterEventMap[e as keyof typeof filterEventMap]
  )
  const time = +new Date(timestamp)
  let skip = spuriousEvents.includes(state)
      || filterEventTypes.length && !filterEventTypes.includes(eventType)
      || filterRadios.length && !filterRadios.includes(radio)

  if (skip) return acc

  acc.push({
    ...data,
    type: event === 'EVENT_CLIENT_ROAMING' ? TYPES.ROAMING : TYPES.CONNECTION_EVENTS,
    key: time + mac + eventType + index,
    start: time,
    end: time,
    ssid,
    category
  })
  return acc
}, [] as object[]
)

export const formatEventDesc = (evtObj: DisplayEvent, intl: IntlShape) : string => {
  const { code, apName, mac, radio, state, event } = evtObj
  const ap = [apName, mac ? `(${mac})` : ''].filter(Boolean).join(' ')
  return [
    code ? `${mapCodeToFailureText(code, intl)}:` : '',
    `${intl.$t(clientEventDescription(event,state))} @`,
    `${ap} ${formatter('radioFormat')(radio)}`
  ].filter(Boolean).join(' ')
}
export const ClientTroubleShootingConfig = {
  selection: [
    {
      entityName: {
        singular: defineMessage({ defaultMessage: 'category' }),
        plural: defineMessage({ defaultMessage: 'categories' })
      },
      selectionType: 'category',
      defaultValue: [],
      placeHolder: defineMessage({ defaultMessage: 'All Categories' }),
      options: categoryOptions
    },
    {
      entityName: {
        singular: defineMessage({ defaultMessage: 'type' }),
        plural: defineMessage({ defaultMessage: 'types' })
      },
      selectionType: 'type',
      defaultValue: [],
      placeHolder: defineMessage({ defaultMessage: 'All Types' }),
      options: [
        {
          value: INFO_UPDATED,
          label: defineMessage({ defaultMessage: 'Client associated' })
        },
        {
          value: ROAMED,
          label: defineMessage({ defaultMessage: 'Client roamed' })
        },
        {
          value: DISCONNECTED,
          label: defineMessage({ defaultMessage: 'Client disconnected' })
        },
        {
          value: FAILURE,
          label: defineMessage({ defaultMessage: 'Connection failure' })
        },
        {
          value: INCIDENT,
          label: defineMessage({ defaultMessage: 'Incident' })
        }
      ]
    },
    {
      entityName: {
        singular: defineMessage({ defaultMessage: 'radio' }),
        plural: defineMessage({ defaultMessage: 'radios' })
      },
      selectionType: 'radio',
      defaultValue: [],
      placeHolder: defineMessage({ defaultMessage: 'All Radios' }),
      options: [
        {
          value: RADIO2DOT4G,
          label: defineMessage({ defaultMessage: '2.4 GHz' })
        },
        {
          value: RADIO5G,
          label: defineMessage({ defaultMessage: '5 GHz' })
        },
        {
          value: RADIO65G,
          label: defineMessage({ defaultMessage: '6 GHz' })
        }
      ]
    } ],
  timeLine: [
    {
      title: defineMessage({ defaultMessage: 'Connection Events' }),
      value: TYPES.CONNECTION_EVENTS,
      chartMapping: [
        { key: 'all', label: 'all', chartType: 'scatter' },
        { key: 'success', label: 'success', chartType: 'scatter' },
        { key: 'failure', label: 'failure', chartType: 'scatter' },
        { key: 'slow', label: 'slow', chartType: 'scatter' },
        { key: 'disconnect', label: 'disconnect', chartType: 'scatter' }
      ] as { key: string, label: string, chartType: string }[],
      showResetZoom: true,
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'Success' }),
          value: SUCCESS
        },
        {
          title: defineMessage({ defaultMessage: 'Failure' }),
          value: FAILURE
        },
        {
          title: defineMessage({ defaultMessage: 'Slow' }),
          value: SLOW
        },
        {
          title: defineMessage({ defaultMessage: 'Disconnect' }),
          value: DISCONNECT,
          isLast: true
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Roaming' }),
      value: TYPES.ROAMING,
      chartMapping: [
        { key: 'all', label: 'all', chartType: 'scatter' },
        { key: 'network1_5GHz', label: 'network1_5GHz', chartType: 'bar' }
      ] as { key: string, label: string, chartType: string }[],
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'Network1_5GHz' }),
          value: 'network1_5GHz',
          isLast: true
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Connection Quality' }),
      value: TYPES.CONNECTION_QUALITY,
      chartMapping: [
        { key: 'all', label: 'all', chartType: 'bar' },
        { key: 'rss', label: 'rss', chartType: 'bar' },
        { key: 'snr', label: 'snr', chartType: 'bar' },
        { key: 'throughput', label: 'throughput', chartType: 'bar' },
        { key: 'avgTxMCS', label: 'avgTxMCS', chartType: 'bar' }
      ] as { key: string, label: string, chartType: string }[],
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'RSS' }),
          value: 'RSS'
        },
        {
          title: defineMessage({ defaultMessage: 'SNR' }),
          value: 'SNR'
        },
        {
          title: defineMessage({ defaultMessage: 'Client Throughput' }),
          value: 'clientThroughput'
        },
        {
          title: defineMessage({ defaultMessage: 'Avg. MCS(Downlink)' }),
          value: 'AvgMCS',
          isLast: true
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Network Incidents' }),
      value: TYPES.NETWORK_INCIDENTS,
      hasXaxisLabel: true,
      chartMapping: [
        { key: 'all', label: 'all', chartType: 'bar' },
        { key: 'connection', label: 'clientConnection', chartType: 'bar' },
        { key: 'performance', label: 'performance', chartType: 'bar' },
        { key: 'infratructure', label: 'infratructure', chartType: 'bar' }
      ] as { key: string, label: string, chartType: string }[],
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'Client Connection' }),
          value: 'clientConnection'
        },
        {
          title: defineMessage({ defaultMessage: 'Performance' }),
          value: 'performance'
        },
        {
          title: defineMessage({ defaultMessage: 'Infratructure' }),
          value: 'infratructure',
          isLast: true
        }
      ]
    }
  ]
}

export const connectionQualityLabels = {
  rss: { label: 'RSS', formatter: 'decibelMilliWattsFormat' },
  snr: { label: 'SNR', formatter: 'decibelFormat' },
  throughput: { label: 'Client Throughput', formatter: 'networkSpeedFormat' },
  avgTxMCS: { label: 'Avg MCS (Downlink)', formatter: 'networkSpeedFormat' }
}

export const transformConnectionQualities = (connectionQualities?: ConnectionQuality[]) => {
  if (typeof connectionQualities === 'undefined') {
    return []
  }

  const mappedQuality = connectionQualities.map((val) => {
    const rss = getConnectionQualityFor('rss', val.rss)
    const snr = getConnectionQualityFor('snr', val.snr)
    const throughput = getConnectionQualityFor('throughput', val.throughput)
    const avgTxMCS = getConnectionQualityFor('avgTxMCS', val.avgTxMCS)
    const worseQuality = takeWorseQuality(...[rss, snr, throughput, avgTxMCS])
    return {
      ...val,
      rss,
      snr,
      throughput,
      avgTxMCS,
      all: worseQuality
    }})

  return {
    all: mappedQuality,
    rss: mappedQuality.filter(val => val.rss),
    snr: mappedQuality.filter(val => val.snr),
    throughput: mappedQuality.filter(val => val.throughput),
    avgTxMCS: mappedQuality.filter(val => val.avgTxMCS)
  }
}

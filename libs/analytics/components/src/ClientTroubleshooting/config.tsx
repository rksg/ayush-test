import { defineMessage, IntlShape } from 'react-intl'

import {
  categoryOptions,
  mapCodeToFailureText,
  clientEventDescription
} from '@acx-ui/analytics/utils'
import { formatter } from '@acx-ui/utils'


import { ConnectionEvent } from './services'

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

export type DisplayEvent = {
  start: number,
  end: number,
  code: string | null,
  apName: string,
  mac: string,
  radio: string,
  state: string,
  event: string,
  category: string,
  type: string
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
  const { event, state, timestamp, mac, ttc, radio, code, failedMsgId } = data
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
    }
  ],
  timeLine: [
    {
      title: defineMessage({ defaultMessage: 'Connection Events' }),
      value: TYPES.CONNECTION_EVENTS,
      chartType: 'scatter',
      chartMapping: [
        { key: 'all', label: 'all' },
        { key: 'success', label: 'success' },
        { key: 'failure', label: 'failure' },
        { key: 'slow', label: 'slow' },
        { key: 'disconnect', label: 'disconnect' }
      ] as { key: string, label: string, color: string }[],
      showResetZoom: true,
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'Success' }),
          chartType: 'scatter',
          value: SUCCESS
        },
        {
          title: defineMessage({ defaultMessage: 'Failure' }),
          chartType: 'scatter',
          value: FAILURE
        },
        {
          title: defineMessage({ defaultMessage: 'Slow' }),
          chartType: 'scatter',
          value: SLOW
        },
        {
          title: defineMessage({ defaultMessage: 'Disconnect' }),
          chartType: 'scatter',
          value: DISCONNECT,
          isLast: true
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Roaming' }),
      value: TYPES.ROAMING,
      chartType: 'scatter',
      chartMapping: [
        { key: 'all', label: 'all' },
        { key: 'network1_5GHz', label: 'network1_5GHz' }
      ] as { key: string, label: string, color: string }[],
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'Network1_5GHz' }),
          chartType: 'bar',
          value: 'network1_5GHz',
          isLast: true
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Connection Quality' }),
      value: TYPES.CONNECTION_QUALITY,
      chartType: 'bar',
      chartMapping: [
        { key: 'all', label: 'all' },
        { key: 'rss', label: 'rss' },
        { key: 'snr', label: 'snr' },
        { key: 'clientThroughput', label: 'clientThroughput' },
        { key: 'AvgMCS', label: 'AvgMCS' }
      ] as { key: string, label: string, color: string }[],
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'RSS' }),
          chartType: 'bar',
          value: 'RSS'
        },
        {
          title: defineMessage({ defaultMessage: 'SNR' }),
          chartType: 'bar',
          value: 'SNR'
        },
        {
          title: defineMessage({ defaultMessage: 'Client Throughput' }),
          chartType: 'bar',
          value: 'clientThroughput'
        },
        {
          title: defineMessage({ defaultMessage: 'Avg. MCS(Downlink)' }),
          chartType: 'bar',
          value: 'AvgMCS',
          isLast: true
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Network Incidents' }),
      value: TYPES.NETWORK_INCIDENTS,
      chartType: 'bar',
      hasXaxisLabel: true,
      chartMapping: [
        { key: 'all', label: 'all' },
        { key: 'clientConnection', label: 'clientConnection' },
        { key: 'performance', label: 'performance' },
        { key: 'infratructure', label: 'infratructure' }
      ] as { key: string, label: string, color: string }[],
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'Client Connection' }),
          chartType: 'bar',
          value: 'clientConnection'
        },
        {
          title: defineMessage({ defaultMessage: 'Performance' }),
          chartType: 'bar',
          value: 'performance'
        },
        {
          title: defineMessage({ defaultMessage: 'Infratructure' }),
          chartType: 'bar',
          value: 'infratructure',
          isLast: true
        }
      ]
    }
  ]
}

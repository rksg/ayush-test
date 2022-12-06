import { defineMessage } from 'react-intl'

import { categoryOptions } from '@acx-ui/analytics/utils'

import { ConnectionEvent } from './services'

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
  ROAMING: 'roaming'
}

export const eventsToHide = [
  EVENT_STATES.JOIN,
  EVENT_STATES.SPURIOUS_DISCONNECT,
  EVENT_STATES.SPURIOUS_INFO_UPDATED
]

export const spuriousEvents = [
  EVENT_STATES.JOIN,
  EVENT_STATES.SPURIOUS_DISCONNECT,
  EVENT_STATES.SPURIOUS_INFO_UPDATED
]

export const categorizeEvent = (name: string, ttc: number) => {
  const successEvents = [INFO_UPDATED, JOIN, ROAMED].map(
    key => filterEventMap[key as keyof typeof filterEventMap]
  )
  if (name === 'EVENT_CLIENT_DISCONNECT') return 'disconnect'
  if (!successEvents.includes(name)) return 'failure'
  if (ttc !== null && ttc >= 4000) return 'slow'
  return 'success'
}
// common utility for history and connection events chart
export const transformEvents = (events: ConnectionEvent[], selectedEvents: string[]) => {
  return events.reduce((acc, data, index) => {
    const { event, state, timestamp, mac, ttc, radio, code, failedMsgId  } = data
    if (code === 'eap' && EAPOLMessageIds.includes(failedMsgId)) {
      data.code = 'eapol'
    }

    const category = categorizeEvent(event, ttc)
    const eventType = category === 'failure' ? filterEventMap[FAILURE] : event

    const selEventsFilterMap = selectedEvents.map(e => filterEventMap[e as keyof typeof filterEventMap])
    const time = +new Date(timestamp)

    const skip = eventsToHide.includes(state) || selectedEvents.length
      ? !selEventsFilterMap.includes(eventType) || !selEventsFilterMap.includes(radio)
      : false
    
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
  }, [] as object[])
}

export const ClientTroubleShootingConfig = {
  selection: [
    {
      selectionType: 'category',
      defaultValue: [],
      placeHolder: defineMessage({ defaultMessage: 'All Categories' }),
      options: categoryOptions
    },
    {
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
    { title: defineMessage({ defaultMessage: 'Connection Events' }) },
    { title: defineMessage({ defaultMessage: 'Roaming' }) },
    { title: defineMessage({ defaultMessage: 'Connection Quality' }) },
    { title: defineMessage({ defaultMessage: 'Network Incidents' }) }
  ]
}
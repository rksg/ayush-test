import { ReactNode } from 'react'

import { defineMessage } from 'react-intl'

import {
  categoryOptions
} from '@acx-ui/analytics/utils'

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
export const EVENTS = 'events'
export const QUALITY = 'quality'
export const ROAMING = 'roaming'
export const INCIDENTS = 'incidents'
export const ALL = 'all'

// In RA these events are hidden
export const spuriousEvents = [
  EVENT_STATES.JOIN,
  EVENT_STATES.SPURIOUS_DISCONNECT,
  EVENT_STATES.SPURIOUS_INFO_UPDATED
]

export type OnDatazoomEvent = {
  batch?: {
    startValue: number, endValue: number
  }[],
  start?: number,
  end?: number
}

export type DisplayEvent = ConnectionEvent & {
  start: number;
  end: number;
  code: string | null;
  apName: string;
  mac: string;
  radio: string;
  state: string;
  event: string;
  category: string;
}
export type ChartMapping = { key: string; label: string; chartType: string; series: string }

export const eventColorByCategory = {
  [DISCONNECT]: '--acx-neutrals-50',
  [SUCCESS]: '--acx-semantics-green-50',
  [FAILURE]: '--acx-semantics-red-50',
  [SLOW]: '--acx-semantics-yellow-50'
}

export const rssGroups = {
  good: { lower: -74 },
  average: { lower: -85, upper: -75 },
  bad: { upper: -86 }
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
      showCount: true,
      chartMapping: [
        { key: 'all', label: 'all', chartType: 'scatter', series: 'events' },
        { key: 'success', label: 'success', chartType: 'scatter', series: 'events' },
        { key: 'failure', label: 'failure', chartType: 'scatter', series: 'events' },
        { key: 'slow', label: 'slow', chartType: 'scatter', series: 'events' },
        { key: 'disconnect', label: 'disconnect', chartType: 'scatter', series: 'events' }
      ] as ChartMapping[],
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
      showCount: true,
      chartMapping: [
        { key: 'all', label: 'all', chartType: 'scatter', series: 'roaming' }
      ] as ChartMapping[]
    },
    {
      title: defineMessage({ defaultMessage: 'Connection Quality' }),
      value: TYPES.CONNECTION_QUALITY,
      showCount: false,
      chartMapping: [
        { key: 'all', label: 'all', chartType: 'bar', series: 'quality' },
        { key: 'rss', label: 'rss', chartType: 'bar', series: 'quality' },
        { key: 'snr', label: 'snr', chartType: 'bar', series: 'quality' },
        { key: 'throughput', label: 'throughput', chartType: 'bar', series: 'quality' },
        { key: 'avgTxMCS', label: 'avgTxMCS', chartType: 'bar', series: 'quality' }
      ] as ChartMapping[],
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
      showCount: true,
      hasXaxisLabel: true,
      chartMapping: [
        { key: 'all', label: 'all', chartType: 'bar', series: 'incidents' },
        { key: 'connection', label: 'connection', chartType: 'bar', series: 'incidents' },
        { key: 'performance', label: 'performance', chartType: 'bar', series: 'incidents' },
        { key: 'infrastructure', label: 'infrastructure', chartType: 'bar', series: 'incidents' }
      ] as ChartMapping[],
      subtitle: [
        {
          title: defineMessage({ defaultMessage: 'Client Connection' }),
          value: 'connection'
        },
        {
          title: defineMessage({ defaultMessage: 'Performance' }),
          value: 'performance'
        },
        {
          title: defineMessage({ defaultMessage: 'Infrastructure' }),
          value: 'infrastructure',
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

export type Quality = 'bad' | 'average' | 'good' | null | undefined

export type LabelledQuality = {
  rss: { quality: Quality; value: string };
  snr: { quality: Quality; value: string };
  throughput: { quality: Quality; value: string };
  avgTxMCS: { quality: Quality; value: string };
  all: { quality: Quality; value: string };
  seriesKey: 'rss' | 'snr' | 'throughput' | 'avgTxMCS' | 'all';
  start: string;
  end: string;
}
export type IncidentDetails = {
  id?: string,
  start: number,
  date: string,
  description: string,
  title: string,
  icon: ReactNode,
  end?:number,
  code?: string,
  seriesKey?: string,
  color?: string
}
export type RoamingByAP = {
  start: string,
  end: string,
  apMac: string,
  apName: string,
  apModel: string,
  apFirmware: string,
  channel: string,
  radio:string,
  radioMode: string,
  ssid: string,
  spatialStream: string,
  bandwidth: string,
  rss: number,
  bssid: string
}
export interface Event {
  timestamp: string;
  event: string;
  ttc: string;
  mac: string;
  apName: string;
  path: [];
  code: string;
  state: string;
  failedMsgId: string;
  messageIds: string;
  radio: string;
  ssid: string;
  type: string;
  key: string;
  start: number;
  end: number;
  category: string;
  seriesKey: string;
}
export type TimelineData = {
  connectionEvents: EventsCategoryMap;
  roaming: EventsCategoryMap;
  connectionQuality: EventsCategoryMap;
  networkIncidents: NetworkIncidentCategoryMap;
}
export type EventsCategoryMap = {
  [SUCCESS]: Event[] | [];
  [FAILURE]: Event[] | [];
  [DISCONNECT]: Event[] | [];
  [SLOW]: Event[] | [];
  all: Event[] | [];
}
export type NetworkIncidentCategoryMap = {
  connection:IncidentDetails[] |[],
  performance:IncidentDetails[] |[],
  infrastructure:IncidentDetails[] |[],
  all: IncidentDetails[] | [];

}
export type RoamingTimeSeriesData = {
  start: string
  end: string
  label: string
  value: string
  color: string
  details: RoamingByAP
  seriesKey?: string
}
export type RoamingConfigParam = { [key : string]: {
  apMac: string
  radio: string
  apName: string
  apModel:string
  apFirmware: string
}
}
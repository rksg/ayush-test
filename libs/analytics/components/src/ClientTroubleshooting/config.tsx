import { ReactNode } from 'react'

import { MessageDescriptor } from 'react-intl'

import { ClientEventEnum, disconnectClientEventsMap } from '@acx-ui/analytics/utils'

import { ConnectionEvent } from './services'

export const SUCCESS = 'success'
export const SLOW = 'slow'
export const DISCONNECT = 'disconnect'
export const INFO_UPDATED = 'info-updated'
export const JOIN = 'join'
export const BTM_REQUEST = 'btm-request'
export const BTM_RESPONSE = 'btm-response'
export const ROAMED = 'roamed'
export const DISCONNECTED = 'disconnected'
export const FAILURE = 'failure'
export const INCIDENT = 'incident'
export const RADIO2DOT4G = '2.4'
export const RADIO5G = '5'
export const RADIO65G = '6(5)'
export const EAPOLMessageIds = ['21', '22', '23', '24']
export const filterEventMap = {
  [JOIN]: [ClientEventEnum.JOIN],
  [INFO_UPDATED]: [ClientEventEnum.INFO_UPDATED],
  [BTM_REQUEST]: [ClientEventEnum.BTM_REQUEST],
  [BTM_RESPONSE]: [ClientEventEnum.BTM_RESPONSE],
  [ROAMED]: [ClientEventEnum.ROAM],
  [DISCONNECTED]: Object.keys(disconnectClientEventsMap),
  [FAILURE]: ['FAILURE'],
  [RADIO2DOT4G]: ['2.4'],
  [RADIO5G]: ['5'],
  [RADIO65G]: ['6(5)']
}
export const EVENT_STATES = {
  NORMAL: 'normal',
  JOIN: 'join',
  REASSOC: 're-associate',
  SPURIOUS_DISCONNECT: 'spurious-disconnect',
  SPURIOUS_INFO_UPDATED: 'spurious-info-updated',
  ISOLATED_DISCONNECT: 'isolated-disconnect'
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
  type?: string;
}

export type IsVisibleType = () => boolean

export type ChartMapping = {
  key: string
  label: string
  chartType: string
  series: string
  isVisible: IsVisibleType
}

interface BaseSubtitle {
  title: MessageDescriptor | string
  value: string
  isVisible: IsVisibleType
}

export interface RoamingSubtitle extends BaseSubtitle {
  noData: boolean
  apMac: string
  apModel: string
  apFirmware: string
}

type Subtitle = BaseSubtitle | RoamingSubtitle

export type TimelineItem = {
  title: MessageDescriptor
  value: string
  showCount: boolean
  hasXaxisLabel?: boolean
  chartMapping: ChartMapping[]
  showResetZoom?: boolean
  subtitle?: Subtitle[]
  isVisible: IsVisibleType
}

export const btmInfoToDisplayTextMap: Record<string, string> = {
  'BTM_EVENT_RECEIVE_REJECT': 'REJECTED',
  'BTM_EVENT_RECEIVE_ACCEPT': 'ACCEPTED',
  'sticky client': 'sticky',
  'load balancing': 'load balancing'
}

export const rssGroups = {
  good: { lower: -74 },
  average: { lower: -85, upper: -75 },
  bad: { upper: -86 }
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
  timestamp: string
  event: string
  ttc: string
  mac: string
  apName: string
  path: []
  code: string
  state: string
  failedMsgId: string
  messageIds: string
  radio: string
  ssid: string
  type: string
  key: string
  start: number
  end: number
  category: string
  seriesKey: string
  /**
   * Contains `Trigger` field for BTM request event type or
   * `Status` field for BTM response event type
   */
  btmInfo?: string
}
export type TimelineData = {
  connectionEvents: ConnectionEventsCategoryMap
  roaming: EventsCategoryMap
  connectionQuality: EventsCategoryMap
  networkIncidents: NetworkIncidentCategoryMap
}

export type TimelineDataCategoryMap =
  | ConnectionEventsCategoryMap
  | EventsCategoryMap
  | NetworkIncidentCategoryMap

type EventsCategoryMap = {
  [SUCCESS]: Event[] | []
  [FAILURE]: Event[] | []
  [DISCONNECT]: Event[] | []
  [SLOW]: Event[] | []
  all: Event[] | []
}

export const btmEventCategories: Array<keyof ConnectionEventsCategoryMap> = [
  BTM_REQUEST,
  BTM_RESPONSE
]

export const eventCategories: Array<keyof ConnectionEventsCategoryMap> = [
  SUCCESS,
  FAILURE,
  DISCONNECT,
  SLOW,
  ALL
]

export type ConnectionEventsCategoryMap = EventsCategoryMap & {
  [BTM_REQUEST]: Event[] | []
  [BTM_RESPONSE]: Event[] | []
}

type NetworkIncidentCategoryMap = {
  connection:IncidentDetails[] |[],
  performance:IncidentDetails[] |[],
  infrastructure:IncidentDetails[] |[],
  security:IncidentDetails[] |[],
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

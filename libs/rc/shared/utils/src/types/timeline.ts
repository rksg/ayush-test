import { defineMessage } from 'react-intl'

import { TimelineStatus } from '@acx-ui/types'

export type TimelineTypes = 'activities' | 'events' | 'adminLogs'

export enum EventScheduleFrequency {
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Immediate = 'Immediate'
}

export const eventSeverityMapping = {
  All: defineMessage({ defaultMessage: 'All' }),
  Critical: defineMessage({ defaultMessage: 'Critical' }),
  Major: defineMessage({ defaultMessage: 'Major' }),
  Minor: defineMessage({ defaultMessage: 'Minor' }),
  Warning: defineMessage({ defaultMessage: 'Warning' }),
  Info: defineMessage({ defaultMessage: 'Informational' })
}

export const eventTypeMapping = {
  ALL: defineMessage({ defaultMessage: 'All' }),
  AP: defineMessage({ defaultMessage: 'AP' }),
  SECURITY: defineMessage({ defaultMessage: 'Security' }),
  CLIENT: defineMessage({ defaultMessage: 'Client' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  NETWORK: defineMessage({ defaultMessage: 'Network' }),
  EDGE: defineMessage({ defaultMessage: 'RUCKUS Edge' }),
  PROFILE: defineMessage({ defaultMessage: 'Profile' })
}

export const eventProductMapping = {
  ALL: defineMessage({ defaultMessage: 'All' }),
  GENERAL: defineMessage({ defaultMessage: 'General' }),
  WIFI: defineMessage({ defaultMessage: 'Wi-Fi' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  EDGE: defineMessage({ defaultMessage: 'RUCKUS Edge' }),
  POLICY_ENGINE: defineMessage({ defaultMessage: 'Policy Engine' })
}

export type WeekDayName = 'MON'
  | 'TUE'
  | 'WED'
  | 'THU'
  | 'FRI'
  | 'SAT'
  | 'SUN'

export interface Activity {
  admin: {
    name: string
    email: string
    ip: string
    id: string
    interface: string
  }
  descriptionData: { name: string, value:string }[]
  descriptionTemplate: string
  endDatetime: string
  notification: { enabled: boolean, type: string }
  product: string
  requestId: string
  severity: string
  startDatetime: string
  status: TimelineStatus
  steps: {
    id: string
    description: string
    status: TimelineStatus
    progressType: string
    startDatetime: string
    endDatetime: string
    error?: string
  }[]
  tenantId: string
  useCase: string
  linkData?: { name: string, value:string }[]
  linkTemplate?: string
}

export interface ActivityApCompatibility {
  data: ActivityIncompatibleFeatures[]
  page: number
  totalCount: number
}

export interface ActivityApCompatibilityExtraParams {
  impactedCount: number
}

export interface ActivityIncompatibleFeatures {
  id: string
  name: string
  incompatibleFeatures: string[]
}

export interface EventBase {
  apMac: string
  adminName?: string
  entity_id: string
  entity_type: string
  ipAddress?: string
  event_datetime: string
  id: string
  macAddress: string
  message: string
  detailedDescription?: string
  name: string
  product: string
  radio: string
  raw_event: string
  serialNumber: string
  severity: string
  venueId: string
  clientMac?: string
  clientName?: string
  remoteEdgeId?: string
  remoteApSerialId?: string
  clientMldMac?: string
  turnOnTimestamp?: string
  turnOffTimestamp?: string
  portList?: string
  indexName?: string
  authenticationType?: string
}

export interface EventMeta {
  id: EventBase['id']
  apGroupId: string
  apName: string
  isApExists: boolean
  isClientExists?: boolean
  isNetworkExists?: boolean
  isSwitchExists: boolean
  isVenueExists: boolean,
  isUnitExists: boolean,
  isRemoteedgeExists: boolean,
  isRemoteApExists: boolean,
  networkId?: string
  networkName?: string
  switchMac?: string
  switchName: string
  venueName: string
  tableKey?: string
  edgeName: string,
  remoteedgeName: string,
  remoteApName: string
  unitName: string,
  profileName: string
}

export type EventExportSchedule = {
  type: string,
  enable: boolean,
  clientTimeZone?: string,
  sortOrder?: string,
  sortField?: string,
  context?: {
    type?: string,
    entity_type?: [typeof eventTypeMapping],
    product?: [typeof eventProductMapping],
    severity?: [typeof eventSeverityMapping],
    searchString?: string[] | null // API support string array with only one string.
    event_entity_type_all?: string[]
  },
  tenantId?: string,
  period?: {
    from: string,
    to: string
  },
  isSupport?: boolean,
  reportSchedule?: {
    type: EventScheduleFrequency | null,
    dayOfWeek?: WeekDayName | null,
    dayOfMonth?: number | null,
    hour?: number | null,
    minute?: number | null
  },
  recipients: string[]
}


export type Event = EventBase & EventMeta

export type AdminLogBase = EventBase

export type AdminLogMeta = EventMeta

export type AdminLog = AdminLogBase & AdminLogMeta

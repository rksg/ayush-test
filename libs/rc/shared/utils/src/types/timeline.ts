import { TimelineStatus } from '@acx-ui/types'

export type TimelineTypes = 'activities' | 'events' | 'adminLogs'

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
}

export interface EventMeta {
  id: EventBase['id']
  apGroupId: string
  apName: string
  isApExists: boolean
  isClientExists?: boolean
  isNetworkExists?: boolean
  isSwitchExists: boolean
  isVenueExists: boolean
  networkId?: string
  networkName?: string
  switchMac?: string
  switchName: string
  venueName: string
  tableKey?: string
  edgeName: string
}

export type Event = EventBase & EventMeta

export type AdminLogBase = EventBase

export type AdminLogMeta = EventMeta

export type AdminLog = AdminLogBase & AdminLogMeta

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
  status: string
  steps: {
    id: string,
    description: string,
    status: string,
    progressType: string
    startDatetime: string
    endDatetime: string
  }[]
tenantId: string
useCase: string
}

export interface EventBase {
  apMac: string
  entity_id: string
  entity_type: string
  event_datetime: string
  id: string
  macAddress: string
  message: string
  name: string
  product: string
  radio: string
  raw_event: string
  serialNumber: string
  severity: string
  venueId: string
}
export interface EventMeta {
  id: EventBase['id']
  apGroupId: string
  apName: string
  isApExists: boolean
  isSwitchExists: boolean
  isVenueExists: boolean
  switchName: string
  venueName: string
}
export type Event = EventBase & EventMeta

export interface AdminLogBase {
  adminName: string
  entity_id: string
  entity_type: string
  event_datetime: string
  id: string
  message: string
  raw_event: string
  severity: string
}
export interface AdminLogMeta {
  id: AdminLogBase['id']
  isApExists: boolean
  isSwitchExists: boolean
}
export type AdminLog = AdminLogBase & AdminLogMeta

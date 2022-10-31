export interface EdgeViewModel {
  name: string
  status: string
  type: string
  model: string
  serialNumber: string
  ip: string
  ports: string
  venueName: string
  venueId: string
  tags: string[]
}

export enum EdgeStatusEnum {
  REQUIRES_ATTENTION = 'Requires Attention',
  TEMPORARILY_DEGRADED = 'Temporarily degraded',
  IN_SETUP_PHASE = 'In Setup Phase',
  OFFLINE = 'Offline',
  OPERATIONAL = 'Operational'
}
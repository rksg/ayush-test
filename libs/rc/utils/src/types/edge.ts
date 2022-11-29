export interface EdgeSaveData {
  description: string
  edgeGroupId: string
  name: string
  serialNumber: string
  venueId: string
  tags: string // TODO when tags component is ready need to change type to array
}

export interface EdgeViewModel {
  name: string
  deviceStatus: string
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
  IN_SETUP_PHASE = '1_07_Initializing',
  OFFLINE = '1_09_Offline',
  OPERATIONAL = '2_00_Operational',
  NEVER_CONTACTED_CLOUD = '1_01_NeverContactedCloud'
}
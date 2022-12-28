export interface EdgeSaveData {
  description: string
  edgeGroupId: string
  name: string
  serialNumber?: string
  venueId?: string
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

export interface EdgeDnsServers {
  primary: string
  secondary: string
}

export enum EdgeStatusEnum {
  NEVER_CONTACTED_CLOUD = '1_01_NeverContactedCloud',
  INITIALIZING = '1_07_Initializing',
  NEEDS_CONFIG = '1_10_NeedsConfig',
  OPERATIONAL = '2_00_Operational',
  APPLYING_CONFIGURATION = '2_02_ApplyingConfiguration',
  DISCONNECTED_FROM_CLOUD = '3_04_DisconnectedFromCloud'
}
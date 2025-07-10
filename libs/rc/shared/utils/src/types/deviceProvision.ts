import { TimeStamp } from '@acx-ui/types'

export interface DeviceProvision {
  serialNumber: string,
  model: string,
  shipDate: string,
  createdDate: string,
  visibleStatus: string | boolean
}

export interface DeviceProvisionStatus {
    refreshedAt: TimeStamp
}

export interface ImportProvisionsPayload {
  devices: ImportDevice[]
}

export interface ImportDevice {
  name: string
  serial: string
}

export interface HideProvisionsPayload {
  serials: string[]
}
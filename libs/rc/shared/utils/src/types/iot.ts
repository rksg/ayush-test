export interface IotControllerStatus {
  id: string
  name: string
  inboundAddress: string
  serialNumber: string
  publicAddress: string
  publicPort: number
  apiKey: string
  tenantId: string
}

export interface IotControllerSetting {
  id?: string
  name: string
  inboundAddress: string
  publicAddress?: string
  publicPort?: number
  apiKey?: string
  iotSerialNumber: string
}


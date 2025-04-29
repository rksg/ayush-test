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
  serialNumber: string
  name: string
  fqdn: string
  publicFqdn?: string
  publicPort?: number
  publicApiKey?: string
}


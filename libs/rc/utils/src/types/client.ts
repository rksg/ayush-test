export interface ClientList {
  hostname: string
  osType: string
  healthCheckStatus: string
  clientMac: string
  ipAddress: string
  Username: string
  serialNumber: string
  venueId: string
  ssid: string
  wifiCallingClient: string
  sessStartTime: number
  sessStartTimeString: string
  radio: {
    channel: number
    mode: string
  }
  clientAnalytics?: string
  clientVlan: string
  deviceTypeStr: string
  modelName: string
  totalTraffic: string
  trafficToClient: string
  trafficFromClient: string
  receiveSignalStrength: string
  rssi: string
  cpeMac: string
  authmethod: string
  status: string
  encryptMethod: string
  packetsToClient: string
  packetsFromClient: string
  packetsDropFrom: string
  noiseFloor: string
  venueName: string
  apName: string
  networkId: string
  healthStatusReason: string
  lastUpdateTime: string
  switchSerialNumber?: string
  switchName?: string
  deviceTypeIcon: string
  osTypeIcon: string
  healthClass: string
  sessStartTimeParssed: boolean
}

export interface ClientListMeta {
  clientMac: string
  switchSerialNumber?: string
  venueName?: string
  apName?: string
  switchName?: string
}
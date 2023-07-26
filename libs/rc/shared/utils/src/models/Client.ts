export class Client {
  osType?: string
  healthCheckStatus?: string
  clientMac: string
  ipAddress: string
  username: string
  userName: string
  hostname: string
  venueId: string
  venueName: string
  apMac: string
  apSerialNumber: string
  apName: string
  switchSerialNumber: string
  switchName: string
  networkId: string
  networkName: string
  networkSsid: string
  timeConnectedMs: number
  vlan?: number
  vni?: number
  bssid?: string
  rfChannel?: number
  status?: string
  receivedBytes?: number
  receivedPackets?: number
  transmittedBytes?: number
  transmittedPackets?: number
  framesDropped?: number
  receiveSignalStrength_dBm?: number
  snr_dB?: number
  //eric_test noiseFloor_dBm: number
  lastSeenDateTime?: string
  clientIP?: string
  ssid?: string
  serialNumber?: string
  userId?: string
  disconnectTime?: number
  sessionDuration?: number
  id?: string
  wifiCallingCarrierName?: string
  wifiCallingQosPriority?: string
  wifiCallingTotal?: number
  wifiCallingTx?: number
  wifiCallingRx?: number
  isVenueExists?: boolean
  wifiCallingClient?: boolean
  isApExists?: boolean

  constructor () {
    this.clientMac = ''
    this.ipAddress = ''
    this.username = ''
    this.userName = ''
    this.hostname = ''
    this.venueId = ''
    this.venueName = ''
    this.apMac = ''
    this.apSerialNumber = ''
    this.apName = ''
    this.switchSerialNumber = ''
    this.switchName = ''
    this.networkId = ''
    this.networkName = ''
    this.networkSsid = ''
    this.snr_dB = 0
    this.timeConnectedMs = 0
    //eric_test this.noiseFloor_dBm = 0
  }
}

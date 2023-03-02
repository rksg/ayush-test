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
  switchId?: string
  switchSerialNumber?: string
  switchName?: string
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

export interface Guest {
    id: string
    userState: string
    guestType: string
    networkId: string
    expiration: string
    mobilePhoneNumber: string
    emailAddress: string
    notes: string
    maxDevices: number
    deliveryMethods: DelieverType[]
    expiryDate?: string
    creationDate?: string
    passDurationHours?: number
    ssid?: string
    name?: string
    maxNumberOfClients?: number,
    guestStatus: GuestStatusEnum,
    clients?: GuestClient[],
    langCode?: string,
    socialLogin?: string
}

export interface GuestClient {
    osType?: string
    healthCheckStatus?: string
    clientMac: string
    ipAddress: string
    username: string
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
    noiseFloor_dBm: number
    lastSeenDateTime?: string
    clientIP?: string
    ssid?: string
    serialNumber?: string
    userId?: string
    disconnectTime?: number
    sessionDuration?: number
    id?: string
    connectSince?: string
}

export interface GuestExpiration {
    activationType: string;
    duration: number;
    unit: string;
}

export type DelieverType = 'PRINT' | 'SMS' | 'MAIL'

export enum GuestTypesEnum {
    MANAGED = 'GuestPass',
    SELF_SIGN_IN = 'SelfSign',
    HOST_GUEST = 'HostGuest'
}

export enum GuestStatusEnum {
    OFFLINE = 'Offline',
    EXPIRED = 'Expired',
    NOT_APPLICABLE = 'Not Applicable',
    ONLINE = 'Online',
    DISABLED = 'Disabled'
}

export interface ClientList {
  apMac: string
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
  vni?: string
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
  networkType: string
  mldAddr: string
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
    wifiNetworkId: string
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
    clients?: ClientInfo[],
    langCode?: string,
    socialLogin?: string,
    hostApprovalEmail?: string,
    devicesMac?: string[],
    locale?: string
}

export interface UEDetail {
  txBytes?: number
  mac?: string,
  apMac?: string,
  apName?: string,
  osType?: string,
  venueId?: string,
  venueName?: string,
  connectedSince?: string,
  apSerialNumber?: string,
  networkId?: string,
  ip?: string,
  username?: string,
  hostname?: string,
  ssid?: string,
  vlan?: number
  bssid?: string,
  rxBytes?: number
  rxPackets?: number
  txPackets?: number
  snr_dB?: number
  receiveSignalStrength_dBm: number,
  noiseFloor_dBm: number,
  radioChannel?: number
  txDropDataPacket?: number
  healthCheckStatus?: string,
  networkType?: string
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
    HOST_GUEST = 'HostGuest',
    DIRECTORY = 'Directory',
    SAML = 'SAML'
}

export enum GuestStatusEnum {
    OFFLINE = 'Offline',
    EXPIRED = 'Expired',
    NOT_APPLICABLE = 'Not Applicable',
    ONLINE = 'Online',
    DISABLED = 'Disabled'
}

export interface ClientInfo {
  modelName: string
  deviceType: string
  macAddress: string
  osType: string
  ipAddress: string
  username: string
  hostname: string
  identityId?: string
  identityName?: string
  identityGroupId?: string
  identityGroupName?: string
  authenticationStatus: number
  connectedTime: string
  lastUpdatedTime: string
  venueInformation: VenueInformation
  apInformation: ApInformation
  networkInformation: NetworkInformation
  wifiCallingEnabled: boolean
  wifiCallingStatus: WifiCallingStatus
  signalStatus: SignalStatus
  radioStatus: RadioStatus
  trafficStatus: TrafficStatus
  mldMacAddress: string
  cpeMacAddress: string
  band: string
  switchInformation?: SwitchInformation // form GUI
  connectedTimeString: string // form GUI
  connectedTimeParssed: boolean // form GUI
}

export type WiredClientInfo = {
  apId: string
  apName: string
  apMac: string
  portNumber: number
  macAddress: string
  osType: string
  ipAddress: string
  hostname: string
  venueId: string
  venueName: string
  vlanId: number
  connectedTime: string
  connectedTimeString: string // form GUI
  connectedTimeParssed: boolean // form GUI
}

type VenueInformation = {
  id: string
  name: string
}

type ApInformation = {
  serialNumber: string
  name: string
  macAddress: string
  bssid: string
}

export type SwitchInformation = {
  id: string
  name: string
  serialNumber: string
  port?: string
}

type NetworkInformation = {
  id: string
  type: string
  ssid: string
  encryptionMethod: string
  authenticationMethod: string
  vlan: number,
  vni?: string
}

type SignalStatus = {
  snr: number
  rssi: number
  noiseFloor: number
  health: string
  healthDescription: string
}

type RadioStatus = {
  type: string
  channel: number
}

type TrafficStatus = {
  trafficToClient: string
  trafficFromClient: string
  packetsToClient: string
  packetsFromClient: string
  framesDropped: string
  totalTraffic: string
}

type WifiCallingStatus = {
  carrierName: string
  qosPriority: string
  trafficFromClient: string
  trafficToClient: string
  totalTraffic: string
}

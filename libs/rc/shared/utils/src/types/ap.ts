import { APMeshRole, ApDeviceStatusEnum }               from '../constants'
import { ApPosition, CapabilitiesApModel, PoeModeEnum } from '../models'
import { ApDeep }                                       from '../models/ApDeep'
import { ApPacketCaptureStateEnum }                     from '../models/ApPacketCaptureEnum'
import { DeviceGps }                                    from '../models/DeviceGps'
import { DhcpApInfo }                                   from '../models/DhcpApInfo'
import { ExternalAntenna }                              from '../models/ExternalAntenna'
import { VenueLanPort }                                 from '../models/VenueLanPort'

import { ApVenueStatusEnum } from '.'

export interface IpSettings {
  ipType?: string,
  netmask?: string,
  gateway?: string,
  primaryDnsServer?: string,
  secondaryDnsServer?: string
}

export interface APSystem extends IpSettings {
  uptime?: number
  secureBootEnabled?: boolean
}

export interface APNetworkSettings extends IpSettings {
  ip?: string
}

export interface AP {
  IP?: string,
  apMac?: string,
  apStatusData?: {
    APRadio?: Array<RadioProperties>,
    cellularInfo?: CelluarInfo,
    APSystem?: APSystem,
    lanPortStatus?: Array<LanPortStatusProperties>,
    vxlanStatus?: VxlanStatus
  },
  clients?: number,
  deviceGroupId: string,
  deviceGroupName?: string,
  deviceStatus: string,
  meshRole: string,
  model: string,
  name?: string,
  serialNumber: string,
  tags: string,
  venueId: string,
  venueName: string,
  description?: string,
  deviceGps?: DeviceGps,
  deviceStatusSeverity?: ApVenueStatusEnum,
  lastSeenTime?: string,
  uptime?: string,
  password?: string,
  extIp?: string,
  deviceModelType?: string,
  fwVersion?: string,
  isMeshEnable?: boolean,
  rootAP?: {
    name: string,
    serialNumber?: string
  }
  hops?: number,
  apDownRssi?: number,
  apUpRssi?: number,
  poePort?: string,
  healthStatus?: string,
  downLinkCount?: number
}

export interface ApViewModel extends AP {
  channel24?: RadioProperties,
  channel50?: RadioProperties,
  channelL50?: RadioProperties,
  channelU50?: RadioProperties,
  channel60?: RadioProperties
}

export interface APExtended extends AP {
  channel24?: string | number,
  channel50?: string | number,
  channelL50?: string | number,
  channelU50?: string | number,
  channel60?: string | number,
  hasPoeStatus?: boolean,
  isPoEStatusUp?: boolean,
  poePortInfo?: string,
  xPercent?: number,
  yPercent?: number,
  members?: number,
  incidents?: number,
  clients?: number,
  networks?: {
    count?: number
  },
  name?: string,
  switchSerialNumber?: string,
  switchId?: string,
  switchName?: string,
  rogueCategory?: { [key: string]: number }
}

export interface CelluarInfo {
  cellularIsSIM0Present: string
  cellularIMSISIM0: string
  cellularICCIDSIM0: string
  cellularTxBytesSIM0: string
  cellularRxBytesSIM0: string
  cellularSwitchCountSIM0: string
  cellularNWLostCountSIM0: string
  cellularCardRemovalCountSIM0: string
  cellularDHCPTimeoutCountSIM0: string
  cellularDHCPTimeoutCountSIM1: string
  cellularIsSIM1Present: string
  cellularIMSISIM1: string
  cellularICCIDSIM1: string
  cellularTxBytesSIM1: string
  cellularRxBytesSIM1: string
  cellularSwitchCountSIM1: string
  cellularNWLostCountSIM1: string
  cellularCardRemovalCountSIM1: string
  cellularDHCPTimeoutCountSIM?: string
  cellularActiveSim: string
  cellularConnectionStatus: string
  cellularSignalStrength: string
  cellularWanInterface: string
  cellular3G4GChannel: number
  cellularRoamingStatus: string
  cellularBand: string
  cellularIMEI: string
  cellularLTEFirmware: string
  cellularOperator: string
  cellularCountry: string
  cellularIPaddress: string
  cellularSubnetMask: string
  cellularDefaultGateway: string
  cellularRadioUptime: number
  cellularUplinkBandwidth: string
  cellularDownlinkBandwidth: string
  cellularRSRP: number
  cellularRSRQ: number
  cellularSINR: number
  cellularECIO: number
  cellularRSCP: number
}

export interface CellularSim {
  sim0Present: boolean
  sim0PresentData: SimPresentData
  sim1Present: boolean
  sim1PresentData: SimPresentData,
  simPresent: string
}

export interface SimPresentData {
  cellularIMSI: string
  cellularICCID: string
  cellularTxBytes: string
  cellularRxBytes: string
  cellularSwitchCount: string
  cellularNWLostCount: string
  cellularCardRemovalCount: string
  cellularDHCPTimeoutCount: string
}

export interface ApDetails {
  serialNumber: string
  apGroupId: string
  venueId: string
  lanPorts?: ApLanPort
  name: string
  description: string
  softDeleted: boolean
  model: string
  updatedDate: string
  deviceGps?: DeviceGps,
  position?: ApPosition
}

export interface ApGroup {
  aps?: ApDeep[],
  id: string,
  isDefault: boolean,
  name: string,
  venueId: string
}

export interface AddApGroup {
  venueId: string,
  apSerialNumbers?: unknown[],
  name: string,
  id?: string
}

export interface VenueDefaultApGroup {
  id: string,
  isDefault: boolean,
  venueId: string,
  aps?: ApDeep[]
}

export interface ApDetailHeader {
  title: string,
  headers: {
    overview: string,
    clients: number,
    networks: number,
    services: number
  }
}

export interface ApExtraParams {
  channel24: boolean,
  channel50: boolean,
  channelL50: boolean,
  channelU50: boolean,
  channel60: boolean
}

export interface ApStatusDetails {
  name: string,
  serialNumber: string
}
export interface APMesh {
  IP?: string
  apMac?: string
  apStatusData?: {
    APRadio?: Array<RadioProperties>
  },
  clients?: { count: number, names: string[] },
  deviceGroupId?: string,
  deviceGroupName?: string,
  deviceStatus?: string,
  meshRole: APMeshRole,
  hops?: number,
  downlink?: APMesh[],
  uplink?: Uplink[],
  model: string,
  name?: string,
  serialNumber: string,
  tags?: string,
  venueId: string,
  venueName: string,
  apUpRssi?: number,
  apDownRssi?: number,
  rssi?: number,
  children?: APMesh[],
  txFrames?: string,
  rxBytes?: string,
  txBytes?: string,
  rxFrames?: string,
  type?: number,
  upMac?: string,
  downlinkCount?: number,
}
export interface FloorPlanMeshAP extends APMesh {
  floorplanId?: string;
}
export interface Uplink{
  txFrames: string,
  rssi: number,
  rxBytes: string,
  txBytes: string,
  rxFrames: string,
  type: number,
  upMac: string
}

export interface LanPort {
  defaultType: string
  id: string
  isPoeOutPort: boolean
  isPoePort: boolean
  supportDisable: boolean
  trunkPortOnly: boolean
  untagId: number
  vlanMembers: string,
  enabled?: boolean,
  portId?: string,
  type?: 'ACCESS' | 'GENERAL' | 'TRUNK',
  vni: number
}

export interface ApModel {
  allowDfsCountry: string[],
  canSupportCellular: boolean,
  canSupportLacp: boolean,
  canSupportPoeMode: boolean,
  canSupportPoeOut: boolean,
  capabilityScore: number,
  has160MHzChannelBandwidth: boolean,
  isOutdoor: boolean,
  lanPortPictureDownloadUrl: string,
  lanPorts: LanPort[],
  ledOn: boolean,
  lldpAdInterval: number,
  lldpEnable: boolean,
  lldpHoldTime: number,
  lldpMgmtEnable: boolean,
  model: string,
  pictureDownloadUrl: string,
  poeModeCapabilities?: string[],
  requireOneEnabledTrunkPort: boolean,
  simCardPrimaryEnabled: boolean,
  simCardPrimaryRoaming: boolean,
  simCardSecondaryEnabled: boolean,
  simCardSecondaryRoaming: boolean,
  supportChannel144: boolean,
  supportDual5gMode: boolean,
  supportTriRadio: boolean,
  maxChannelization5G?: number,
  maxChannelization6G?: number,
  externalAntenna?: ExternalAntenna,
  supportMesh?: boolean,
  version?: string,
  support11AX?: boolean
}

export interface PingAp {
  targetHost: string
}

export interface RadioProperties {
  Rssi: string | null,
  txPower?: string | null,
  channel: string | number,
  band?: string,
  radioId?: number,
  operativeChannelBandwidth?: string
}

export interface LanPortStatusProperties {
  phyLink: string,
  port: string
}

export interface VxlanStatus {
  vxlanMtu: number
}

export enum GpsFieldStatus {
  INITIAL,
  FROM_VENUE,
  MANUAL
}

export interface ApLanPort {
  lanPorts: LanPort[],
  useVenueSettings: boolean
}

export interface ApLedSettings {
  ledEnabled: boolean,
  useVenueSettings: boolean
}

export interface ApBssColoringSettings {
  bssColoringEnabled: boolean,
  useVenueSettings: boolean
}

export interface ApRadio {
  enable24G: boolean,
  enable50G?: boolean,
  enable6G?: boolean,
  enableLower5G?: boolean,
  enableUpper5G?: boolean,
  useVenueSettings: boolean
}


export interface APPhoto {
  createdDate: string,
  id: string,
  imageId: string,
  imageName: string,
  imageUrl: string,
  updatedDate: string
}

export type DhcpApResponse = {
  requestId: string,
  response?: DhcpApInfo[]
}

export type DhcpAp = DhcpApResponse | DhcpApInfo[]

export interface PacketCaptureState {
  status: ApPacketCaptureStateEnum,
  fileName?: string,
  fileUrl?: string,
  sessionId?: string
}

export interface Capabilities {
  version?: string,
  apModels: CapabilitiesApModel[]
}

export interface ModelLanPorts {
  lanPorts?: ModelLanPort[],
  useVenueSettings?: boolean,
  label?: string,
  value?: string,
  poeMode?: PoeModeEnum,
  poeOut?: boolean,
  model?: string
}

export interface PacketCaptureOperationResponse {
  requestId: string;
  response?: {
    sessionId: string;
  }
}
export class ModelLanPort extends VenueLanPort {
  header?: string
}

export interface WifiApSetting {
  useVenueSettings: boolean;
  externalAntenna?: ExternalAntenna;
  poeOut?: boolean | boolean[];
  poeMode?: string;
  lanPorts?: LanPort[];
  lan?: LanPort[];
}

export interface ApDirectedMulticast {
  useVenueSettings: boolean,
  wiredEnabled: boolean,
  wirelessEnabled: boolean,
  networkEnabled: boolean
}


export interface APExtendedGrouped extends APExtended {
  networks: {
    count: number
    names: string[]
  }
  members: number
  incidents: number
  deviceGroupId: string
  deviceGroupName: string
  deviceStatus: string
  model: string
  clients: number
  name?: string
  aps: APExtended[],
  children?: APExtended[],
  id?: number | string
}
export type ImportErrorRes = {
  errors: {
    code: number
    description?: string
    message?: string
  }[],
  downloadUrl?: string
  txId: string
  fileErrorsCount: number
}

export enum MeshModeEnum {
  AUTO ='AUTO',
  ROOT ='ROOT',
  MESH ='MESH',
  DISABLED = 'DISABLED'
}

export enum UplinkModeEnum {
  MANUAL = 'MANUAL',
  SMART = 'SMART'
}

export type APMeshSettings = {
  venueMeshEnabled?: boolean, //read-only (get method only)
  meshMode: MeshModeEnum,
  uplinkMode?: UplinkModeEnum,
  uplinkMacAddresses?: string[]
}

export type MeshApNeighbor = {
  rssi: number,
  mac: string,
  apName: string
}

export type MeshUplinkAp = {
  name: string,
  deviceStatus: string,
  healthStatus: string,
  neighbors: MeshApNeighbor[]
}

export interface ApRfNeighbor {
  deviceName: string,
  apMac: string,
  status: ApDeviceStatusEnum,
  model: string,
  venueName: string,
  ip: string,
  channel24G: string | null,
  channel5G: string | null,
  channel6G: string | null,
  snr24G: string | null,
  snr5G: string | null,
  snr6G: string | null
}

export interface ApLldpNeighbor {
  neighborManaged: boolean,
  neighborSerialNumber: string | null,
  lldpInterface: string | null,
  lldpVia: string | null,
  lldpRID: string | null,
  lldpTime: string,
  lldpChassisID: string | null,
  lldpSysName: string | null,
  lldpSysDesc: string | null,
  lldpMgmtIP: string | null,
  lldpCapability: string | null,
  lldpPortID: string | null,
  lldpPortDesc: string | null,
  lldpMFS: string | null,
  lldpPMDAutoNeg: string | null,
  lldpAdv: string | null,
  lldpMAUOperType: string | null,
  lldpMDIPower: string | null,
  lldpDeviceType: string | null,
  lldpPowerPairs: string | null,
  lldpClass: string | null,
  lldpPowerType: string | null,
  lldpPowerSource: string | null,
  lldpPowerPriority: string | null,
  lldpPDReqPowerVal: string | null,
  lldpPSEAllocPowerVal: string | null,
  lldpUPOE: string | null
}

export interface ApRfNeighborsResponse {
  detectedTime: string,
  neighbors: ApRfNeighbor[]
}

export interface ApLldpNeighborsResponse {
  detectedTime: string,
  neighbors: ApLldpNeighbor[]
}

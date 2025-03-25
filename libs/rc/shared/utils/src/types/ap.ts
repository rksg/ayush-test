import { DefaultOptionType } from 'antd/lib/select'

import { APMeshRole, ApDeviceStatusEnum } from '../constants'
import {
  ApAntennaTypeEnum,
  ApDeep,
  ApDhcpRoleEnum,
  ApPacketCaptureStateEnum,
  ApPosition,
  BandModeEnum,
  DeviceGps,
  DhcpApInfo,
  ExternalAntenna,
  PoeModeEnum,
  VenueLanPort
} from '../models'
import { IsolatePacketsTypeEnum } from '../models/ClientIsolationEnum'

import { ApVenueStatusEnum, CountAndNames } from '.'

export interface IpSettings {
  ipType?: string,
  netmask?: string,
  gateway?: string,
  primaryDnsServer?: string,
  secondaryDnsServer?: string
}

interface NewApNetworkStatus {
  ipAddress: string
  externalIpAddress: string
  ipAddressType: string
  netmask: string
  gateway: string
  primaryDnsServer: string
  secondaryDnsServer: string
  managementTrafficVlan: number
}

interface NewApRadioProperties {
    id: number
    band: string
    transmitterPower: string
    channel: number
    channelBandwidth: string
    rssi: number
    actualTxPower?: number
}

export interface APSystem extends IpSettings {
  uptime?: number
  secureBootEnabled?: boolean
  managementVlan?: number
}

export interface APNetworkSettings extends IpSettings {
  ip?: string
}

export interface AP {
  IP?: string,
  apMac?: string,
  apStatusData?: ApStatus,
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
  downlinkCount?: number,
  apRadioDeploy?: string,
  powerSavingStatus?: string,
  lbsStatus?: {
    managementConnected?: boolean,
    serverConnected?: boolean
  }
  switchId?: string,
  switchName?: string,
  switchPort?: string,
  switchSerialNumber?: string
}

export interface NewAPModel {
  serialNumber: string
  name?: string
  apGroupId?: string
  apGroupName?: string
  venueId?: string
  venueName? : string
  tags?: string[]
  model?: string
  supportSecureBoot?: boolean
  macAddress?: string
  firmwareVersion?: string
  uptime?: number
  lastUpdatedTime?: Date
  lastSeenTime?: Date
  statusSeverity?: ApVenueStatusEnum
  status?: ApDeviceStatusEnum
  meshRole?: string
  clientCount?: number
  networkStatus?: NewApNetworkStatus
  lanPortStatuses?: {
    id: string
    physicalLink: string
  }[]
  radioStatuses?: NewApRadioProperties[]
  cellularStatus?: NewCelluarInfo
  afcStatus?: NewAFCInfo
  floorplanId?: string
  powerSavingStatus?: string
  meshStatus?: MeshStatus
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
  rogueCategory?: { [key: string]: number },
  incompatible?: number
}

export interface NewAPModelExtended extends NewAPModel {
  venueName?: string
  poePort?: string
  apGroupName?: string
  deviceModelType?: ApModelTypeEnum
  channel24?: string | number
  channel50?: string | number
  channelL50?: string | number
  channelU50?: string | number
  channel60?: string | number
  actualTxPower24?: string | number
  actualTxPower50?: string | number
  actualTxPowerL50?: string | number
  actualTxPowerU50?: string | number
  actualTxPower60?: string | number
  hasPoeStatus?: boolean
  isPoEStatusUp?: boolean
  poePortInfo?: string
  xPercent?: number
  yPercent?: number
  members?: number
  incidents?: number
  clients?: number
  networks?: {
    count?: number
  }
  networksInfo?: {
    count?: number
    names?: string[]
  }
  switchSerialNumber?: string
  switchId?: string
  switchName?: string
  switchPort?: string
  rogueCategory?: { [key: string]: number }
  incompatible?: number
  compatibilityStatus?: string
  children?: NewAPModel[]
  deviceGroupName?: string
}
export interface NewCelluarInfo {
  activeSim: string,
  imei: string,
  lteFirmware: string,
  country: string,
  operator: string,
  connectionStatus: string,
  connectionChannel: number,
  rfBand: string,
  wanInterface: string,
  ipAddress: string,
  netmask: string,
  gateway: string,
  roamingStatus: string,
  radioUptime: number,
  uplinkBandwidth: string,
  downlinkBandwidth: string,
  signalStrength: string,
  ecio: number,
  rscp: number,
  rsrp: number,
  rsrq: number,
  sinr: number,
  primarySimStatus: {
    iccid: string,
    imsi: string,
    txBytes: number,
    rxBytes: number,
    cardRemovalCount: number,
    dhcpTimeoutCount: number,
    networkLostCount: number,
    switchCount: number,
  },
  secondarySimStatus: {
    iccid: string,
    imsi: string,
    txBytes: number,
    rxBytes: number,
    cardRemovalCount: number,
    dhcpTimeoutCount: number,
    networkLostCount: number,
    switchCount: number,
  }
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
  id: string,
  name: string,
  isDefault: boolean,
  venueId: string,
  aps?: ApDeep[]
}

export interface ApGroupViewModel extends ApGroup {
  venueName?: string,
  members?: CountAndNames,
  networks?: CountAndNames,
  clients?: number,
  incidents?: unknown
}

export interface NewApGroupViewModelResponseType {
  id?: string,
  name?: string,
  description?: string,
  isDefault?: boolean,
  venueId?: string,
  apSerialNumbers?: string[],
  wifiNetworkIds?: string[],
  clientCount?: number
}

export interface NewGetApGroupResponseType {
  id: string,
  name: string,
  description: string,
  isDefault: boolean,
  apSerialNumbers?: string[],  // undefined: when no ap associated
}

export interface AddApGroup {
  venueId: string,  // deprecated in v1.1
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

export interface ApGroupDetailHeader {
  title: string
  headers: {
    members: number
    networks: number
  }
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

export interface MeshLinkStatus {
  macAddress: string,
  rssi: number
}
export interface MeshStatus {
  hopCount: number,
  uplinks?: MeshLinkStatus[],
  downlinks?: MeshLinkStatus[],
  neighbors?: MeshLinkStatus[],
  radios?: MeshRadioStatus[]
}
export interface APMesh {
  IP?: string
  apMac?: string
  apStatusData?: {
    APRadio?: Array<RadioProperties>
  },
  clients?: CountAndNames,
  clientCount?: number
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
  meshBand?: string
}

export interface RbacAPMesh {
  root: NewAPModel,
  members: NewAPModel[]
}

export interface MeshRadioStatus {
  band: string
}

export interface FloorPlanMeshAP extends APMesh {
  floorplanId?: string;
  xPercent?: number;
  yPercent?: number;
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
  vni: number,
  ethernetPortProfileId?: string,
  softGreProfileId?: string,
  softGreEnabled?: boolean,
  ipsecProfileId?: string,
  ipsecEnabled?: boolean,
  dhcpOption82?: LanPortSoftGreProfileSettings,
  clientIsolationProfileId?: string,
  clientIsolationEnabled?: boolean,
  clientIsolationSettings?: LanPortClientIsolationSettings
}

export enum ApModelTypeEnum {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor'
}
export interface CapabilitiesApModel {
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
  simCardPrimaryEnabled?: boolean,
  simCardPrimaryRoaming?: boolean,
  simCardSecondaryEnabled?: boolean,
  simCardSecondaryRoaming?: boolean,
  supportChannel144: boolean,
  supportDual5gMode: boolean,
  supportTriRadio: boolean,
  maxChannelization5G?: number,
  maxChannelization6G?: number,
  externalAntenna?: ExternalAntenna,
  supportMesh?: boolean,
  version?: string,
  support11AX?: boolean,
  supportAntennaType?: boolean,
  antennaTypeCapabilities?: ApAntennaTypeEnum[],
  defaultAntennaType?: ApAntennaTypeEnum,
  supportBandCombination?: boolean,
  bandCombinationCapabilities?: BandModeEnum[],
  defaultBandCombination?: BandModeEnum,
  supportApStickyClientSteering?: boolean,
  supportAggressiveTxPower?: boolean,
  supportAutoCellSizing?: boolean,
  supportSmartMonitor?: boolean,
  supportMesh5GOnly6GOnly?: boolean,
  supportSoftGre?: boolean,
  supportIoT?: boolean,
  usbPowerEnable?: boolean
}

export interface PingAp {
  targetHost: string
}

export interface RadioProperties {
  Rssi: string | null,
  txPower?: string | null,
  actualTxPower?: number,
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
  vxlanMtu: number,
  tunStatus: VxlanTunnelStatus,
  primaryRvtepInfo: VxlanRvtepInfo,
  activeRvtepInfo: VxlanRvtepInfo
}

export enum VxlanTunnelStatus {
  CONNECTED = 'VxLAN_TUN_STATUS_CONNECTED',
  DISCONNECTED = 'VxLAN_TUN_STATUS_DISCONNECTED'
}

export interface VxlanRvtepInfo {
  deviceId: string
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

export interface ApUsbSettings {
  usbPortEnable: boolean,
  useVenueSettings: boolean
}

export interface ApBandModeSettings {
  bandMode: BandModeEnum,
  useVenueSettings: boolean
}

export type ApAntennaTypeSettings = {
  antennaType: ApAntennaTypeEnum,
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
  imageId?: string,   // nonRBAC API
  imageName?: string, // nonRBAC API
  imageUrl?: string,  // nonRBAC API
  name?: string,      // RBAC API
  url?: string,       // RBAC API
  updatedDate: string
}

export type DhcpApResponse = {
  requestId: string,
  response?: DhcpApInfo[]
}

export type DhcpAp = DhcpApResponse | DhcpApInfo[]

export interface NewDhcpAp {
  dhcpApRole: ApDhcpRoleEnum
  serialNumber: string
}

export interface PacketCaptureState {
  status: ApPacketCaptureStateEnum,
  fileName?: string,
  fileUrl?: string,
  sessionId?: string
}

export interface NewPacketCaptureState {
  errorMsg?: string
  state: ApPacketCaptureStateEnum,
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

export interface ApSmartMonitor {
  useVenueSettings: boolean,
  enabled: boolean,
  interval: number,
  threshold: number
}

export interface ApIot {
  useVenueSettings: boolean,
  enabled: boolean,
  mqttBrokerAddress: string
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
export interface NewAPExtendedGrouped extends NewAPModelExtended {
  groupedField: string
  groupedValue: string
  members: number
  incidents: number
  model: string
  clients: number
  aps: NewAPModelExtended[],
  children?: NewAPModelExtended[],
  id?: number | string
  deviceGroupName?: string // For the legacy usage of editing/deleting apGroup
  deviceGroupId?: string // For the legacy usage of editing/deleting apGroup
  networksInfo?: { count: number, names: string[] } | undefined
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
  fileErrorCount?: number
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
  deviceStatus?: string,
  healthStatus?: string,
  neighbors: MeshApNeighbor[]
}

export interface AFCProps {
  featureFlag?: boolean,
  isAFCEnabled? : boolean,
  afcInfo?: AFCInfo
}

export interface LPIButtonText {
  buttonText: JSX.Element,
  LPIModeOnChange: Function,
  LPIModeState: boolean,
  isAPOutdoor?: boolean
}

export type AFCInfo = {
  afcStatus?: AFCStatus,
  availableChannel?: number,
  availableChannels?: number[],
  geoLocation?: GeoLocation,
  powerMode?: AFCPowerMode,
  minPowerDbm?: number,
  maxPowerDbm?: number
}

export type NewAFCInfo = {
  afcState?: AFCStatus,
  availableChannels?: number[]
  geoLocationSource?: string
  hasGeoLocation?: boolean
  maxPower?: number
  powerState?: AFCPowerMode
}

export interface GeoLocation {
  height?: number,
  lateralUncertainty?: number,
  latitude?: number,
  longitude?: number,
  source?: string,
  verticalUncertainty?: number
}

export enum AFCPowerMode {
  LOW_POWER = 'LOW_POWER',
  STANDARD_POWER = 'STANDARD_POWER'
}

export enum AFCStatus {
  AFC_NOT_REQUIRED = 'AFC_NOT_REQUIRED',
  WAIT_FOR_LOCATION = 'WAIT_FOR_LOCATION',
  WAIT_FOR_RESPONSE = 'WAIT_FOR_RESPONSE',
  AFC_SERVER_FAILURE = 'AFC_SERVER_FAILURE',
  REJECTED = 'REJECTED',
  PASSED = 'PASSED'
}

export interface ApStatus {
  APRadio?: Array<RadioProperties>,
  cellularInfo?: CelluarInfo,
  APSystem?: APSystem,
  lanPortStatus?: Array<LanPortStatusProperties>,
  vxlanStatus?: VxlanStatus,
  afcInfo?: AFCInfo
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

export interface ApNeighborsResponse {
  neighbors: (ApRfNeighbor|ApLldpNeighbor)[]
  page: number
  totalCount: number
  totalPages: number
}

export interface SupportCcdVenue {
  id: string,
  name: string
}

export interface SupportCcdApGroup {
  apGroupId: string,
  apGroupName: string,
  venueId: string,
  members: number,
  aps: APExtended[]
}

export enum DiagnosisCommands {
  PING = 'PING',
  TRACE_ROUTE = 'TRACE_ROUTE',
  BLINK_LED = 'BLINK_LED'
}

export enum SystemCommands {
  REBOOT = 'REBOOT',
  FACTORY_RESET = 'FACTORY_RESET'
}

export interface StickyClientSteering {
  enabled?: boolean
  snrThreshold?: number
  neighborApPercentageThreshold?: number
}

export interface ApStickyClientSteering extends StickyClientSteering {
  useVenueSettings?: boolean
}

export enum DhcpOption82SubOption1Enum {
  SUBOPT1_AP_INFO_LOCATION = 'SUBOPT1_AP_INFO_LOCATION',
  SUBOPT1_AP_INFO = 'SUBOPT1_AP_INFO',
  SUBOPT1_AP_MAC_ESSID_PRIVACYTYPE = 'SUBOPT1_AP_MAC_ESSID_PRIVACYTYPE',
  SUBOPT1_AP_MAC_HEX = 'SUBOPT1_AP_MAC_hex',
  SUBOPT1_AP_MAC_HEX_ESSID = 'SUBOPT1_AP_MAC_hex_ESSID',
  SUBOPT1_ESSID = 'SUBOPT1_ESSID',
  SUBOPT1_AP_MAC = 'SUBOPT1_AP_MAC',
  SUBOPT1_AP_MAC_ESSID = 'SUBOPT1_AP_MAC_ESSID',
  SUBOPT1_AP_NAME_ESSID = 'SUBOPT1_AP_Name_ESSID',
}

export enum DhcpOption82SubOption2Enum {
  SUBOPT2_CLIENT_MAC = 'SUBOPT2_CLIENT_MAC',
  SUBOPT2_CLIENT_MAC_HEX = 'SUBOPT2_CLIENT_MAC_hex',
  SUBOPT2_CLIENT_MAC_HEX_ESSID = 'SUBOPT2_CLIENT_MAC_hex_ESSID',
  SUBOPT2_AP_MAC = 'SUBOPT2_AP_MAC',
  SUBOPT2_AP_MAC_HEX = 'SUBOPT2_AP_MAC_hex',
  SUBOPT2_AP_MAC_HEX_ESSID = 'SUBOPT2_AP_MAC_hex_ESSID',
  SUBOPT2_AP_MAC_ESSID = 'SUBOPT2_AP_MAC_ESSID',
  SUBOPT2_AP_NAME = 'SUBOPT2_AP_Name',
}

export enum DhcpOption82SubOption151Enum {
  SUBOPT151_AREA_NAME = 'SUBOPT151_AREA_NAME',
  SUBOPT151_ESSID = 'SUBOPT151_ESSID',
}

export enum DhcpOption82MacEnum {
  COLON = 'COLON',
  HYPHEN = 'HYPHEN',
  NODELIMITER = 'NODELIMITER',
}

export interface DhcpOption82Settings {
  subOption151Input:	string
  subOption151Format:	DhcpOption82SubOption151Enum
  subOption2Format:	DhcpOption82SubOption2Enum
  subOption1Format:	DhcpOption82SubOption1Enum
  macFormat:	DhcpOption82MacEnum
  subOption1Enabled:	boolean
  subOption2Enabled:	boolean
  subOption150Enabled:	boolean
  subOption151Enabled:	boolean
}

export interface VenueApModelLanPortSettingsV1 {
  softGreEnabled: boolean
  softGreSettings?: LanPortSoftGreProfileSettings
  softGreProfileId?: string
}

export interface LanPortSoftGreProfileSettings {
  dhcpOption82Enabled?: boolean
  dhcpOption82Settings?: DhcpOption82Settings
}

export interface SoftGreChanges {
  model: string,
  lanPorts: SoftGreLanPortChange[]
}

export enum SoftGreState {
  Init,
  TurnOffSoftGre,
  TurnOnSoftGre,
  ModifySoftGreProfile,
  TurnOffDHCPOption82,
  TurnOnAndModifyDHCPOption82Settings,
  TurnOnLanPort,
  TurnOffLanPort,
  ResetToDefault
}

export enum SoftGreDuplicationChangeState {
  Init,
  OnChangeSoftGreProfile,
  TurnOnSoftGre,
  TurnOffSoftGre,
  TurnOnLanPort,
  TurnOffLanPort,
  ResetToDefault,
  FindTheOnlyVoter,
  ReloadOptionList
}

export interface SoftGreDuplicationChangeDispatcher {
  state: SoftGreDuplicationChangeState
  softGreProfileId?: string
  voter?: Voter
  voters?: Voter[]
  index?: string,
  candidate?: SoftGreOptionCandidate
}

export interface SoftGreOptionCandidate {
  option: DefaultOptionType
  gatewayIps:string[]
}

export interface SoftGreProfileDispatcher {
  portId?: string,
  state: SoftGreState,
  index: number,
  softGreProfileId?: string
}

export interface Voter {
  model?: string,
  serialNumber?: string,
  portId: string,
}

export interface VoteTallyBoard {
  softGreProfileId: string,
  FQDNAddresses: string[],
  name?: string,
  vote: number,
  voters: Voter[]
}

export interface SoftGreLanPortChange {
    lanPortId: string
    lanPortEnable?: boolean
    venueLanPortSettings: VenueApModelLanPortSettingsV1
}


export interface LanPortClientIsolationSettings {
  packetsType: IsolatePacketsTypeEnum
  autoVrrp: boolean
}

export interface VenueLanPortSettings {
  portId?: number
  enabled?: boolean
  softGreEnabled?: boolean
  softGreSettings?: LanPortSoftGreProfileSettings
  clientIsolationEnabled?: boolean
  clientIsolationSettings?: LanPortClientIsolationSettings
}

export interface APLanPortSettings extends VenueLanPortSettings {
  overwriteUntagId?: number
  overwriteVlanMembers?: string
}

/* eslint-disable max-len */
import { LldpQosModel } from '../models/PortSetting'

import { Acl, Vlan } from './venue'

import { GridDataRow } from './'

export const SWITCH_SERIAL_PATTERN=/^(FEG|FEM|FEA|FEB|FEH|FEJ|FEC|FED|FEE|FEF|FJN|FJP|FEK|FEL|FMD|FME|FMF|FMG|FMU|FMH|FMJ|EZC|EZD|EZE|FLU|FLV|FLW|FLX|FMK|FML|FMM|FMN|FMP|FMQ|FMR|FMS)([0-9A-Z]{2})(0[1-9]|[1-4][0-9]|5[0-4])([A-HJ-NP-Z])([0-9A-HJ-NPRSTV-Z]{3})$/i

export enum IP_ADDRESS_TYPE {
  STATIC = 'static',
  DYNAMIC = 'dynamic'
}

export enum IGMP_SNOOPING_TYPE {
  ACTIVE = 'active',
  PASSIVE = 'passive',
  NONE = 'none'
}

export enum CUSTOMIZE_FLAG {
  ACL = 'ACL',
  VLAN = 'VLAN',
  ALL = 'AL'
}

export enum SwitchStatusEnum {
  NEVER_CONTACTED_CLOUD = 'PREPROVISIONED',
  INITIALIZING = 'INITIALIZING',
  APPLYING_FIRMWARE = 'APPLYINGFIRMWARE',
  OPERATIONAL = 'ONLINE',
  DISCONNECTED = 'OFFLINE',
  STACK_MEMBER_NEVER_CONTACTED = 'STACK_MEMBER_PREPROVISIONED',
  FIRMWARE_UPD_START = 'FIRMWARE_UPD_START',
  FIRMWARE_UPD_VALIDATING_PARAMETERS = 'FIRMWARE_UPD_VALIDATING_PARAMETERS',
  FIRMWARE_UPD_DOWNLOADING = 'FIRMWARE_UPD_DOWNLOADING',
  FIRMWARE_UPD_VALIDATING_IMAGE = 'FIRMWARE_UPD_VALIDATING_IMAGE',
  FIRMWARE_UPD_SYNCING_TO_REMOTE = 'FIRMWARE_UPD_SYNCING_TO_REMOTE',
  FIRMWARE_UPD_WRITING_TO_FLASH = 'FIRMWARE_UPD_WRITING_TO_FLASH',
  FIRMWARE_UPD_FAIL = 'FIRMWARE_UPD_FAIL'
}

export class Switch {
  name: string
  id: string
  description?: string
  venueId: string
  stackMembers: Array<{ model: string, id:string }>
  enableStack?: boolean
  // Specific Setting
  jumboMode?: boolean
  igmpSnooping?: IGMP_SNOOPING_TYPE
  ipAddressType?: IP_ADDRESS_TYPE
  spanningTreePriority?: string
  trustPorts?: Array<string>
  ipFullContentParsed?: boolean
  ipAddress?: string
  subnetMask?: string
  defaultGateway?: string
  ipAddressInterface?: string
  ipAddressInterfaceType?: string
  dhcpServerEnabled?: boolean
  dhcpClientEnabled?: boolean
  initialVlanId?: string
  specifiedType?: string
  rearModule?: string

  constructor () {
    this.name = ''
    this.id = ''
    this.description = ''
    this.venueId = ''
    this.stackMembers = []
    this.enableStack = false

    this.jumboMode = false
    this.igmpSnooping = IGMP_SNOOPING_TYPE.NONE
    this.ipAddress = ''
    this.subnetMask = ''
    this.defaultGateway = ''
    this.spanningTreePriority = ''
    this.ipAddressInterfaceType = 'VE'
    this.ipAddressInterface = '1'
    this.initialVlanId = ''
    this.rearModule = 'none'
  }
}

export class SwitchViewModel extends Switch {
  type?: string
  configReady = false
  syncedSwitchConfig = false
  serialNumber?: string
  isStack?: boolean
  deviceStatus?: SwitchStatusEnum
  model?: string
  venueName?: string
  switchType?: string
  clientCount?: number
  switchMac?: string
  uptime?: string
  switchName?: string
  aclCustomize?: boolean
  vlanCustomize?: boolean
  operationalWarning?: boolean
  cliApplied?: boolean
  formStacking?: boolean
  suspendingDeployTime?: string
  syncDataEndTime?: number
  firmwareVersion?: string
}

export interface SwitchTransactionResp {
  requestId: string;
  response: Switch;
}

export interface SwitchPortViewModel extends GridDataRow {
  cloudPort: boolean;
  name?: string;
  portId: string;
  portIdentifier: string;
  status?: string;
  switchId: string;
  switchUnitId: string;
  switchSerial: string;
  switchName: string;
  switchMac: string;
  switchModel: string;
  stack: boolean;
  deviceStatus: SwitchStatusEnum;
  syncedSwitchConfig: boolean;
  adminStatus?: string;
  portSpeed?: string;
  poeType: string;
  poeEnabled: boolean;
  poeTotal: number;
  poeUsed: number;
  vlanIds?: string;
  unTaggedVlan: string;
  rx?: string;
  tx?: string;
  signalIn?: number;
  signalOut?: number;
  lagName?: string;
  lagId: string;
  neighborName?: string;
  opticsType?: string;
  multicastIn?: string;
  multicastOut?: string;
  broadcastIn?: string;
  broadcastOut?: string;
  inErr?: string;
  outErr?: string;
  crcErr?: string;
  inDiscard?: string;
  acl?: string;
  tag?: string;
  usedInFormingStack: boolean;
  unitStatus: string; // stack unit role (Standalone/Member...etc)
  unitState: SwitchStatusEnum; // stack unit status (Online/Offline)
  SwitchPortStackingPortField: boolean;
}

export enum PORT_SPEED {
  NONE = 'None',
  AUTO = 'Auto',
  TEN_M_FULL = '10-FULL',
  TEN_M_HALF = '10-HALF',
  ONE_HUNDRED_M_FULL = '100-FULL',
  ONE_HUNDRED_M_HALF = '100-HALF',
  ONE_G_FULL = '1000-FULL',
  ONE_G_FULL_MASTER = '1000-FULL-MASTER',
  ONE_G_FULL_SLAVE = '1000-FULL-SLAVE',
  TWO_POINT_FIVE_G_FULL = '2500-FULL',
  TWO_POINT_FIVE_G_FULL_MASTER = '2500-FULL-MASTER',
  TWO_POINT_FIVE_G_FULL_SLAVE = '2500-FULL-SLAVE',
  FIVE_G_FULL = '5G-FULL',
  FIVE_G_FULL_MASTER = '5G-FULL-MASTER',
  FIVE_G_FULL_SLAVE = '5G-FULL-SLAVE',
  TEN_G_FULL = '10G-FULL',
  TEN_G_FULL_MASTER = '10G-FULL-MASTER',
  TEN_G_FULL_SLAVE = '10G-FULL-SLAVE',
  TWENTY_FIVE_G_FULL = '25G-FULL',
  FORTY_G_FULL = '40G-FULL',
  ONE_HUNDRED_G_FULL = '100G-FULL',
  OPTIC = '10G SFP+'
}

export class SwitchEntityEnum {
  static switchList = 'switchList'
  static switchClientList = 'swichClientList'
  static switchModelList = 'switchModelList'
  static switchVlanList = 'switchVlanList'
  static switchPortList = 'switchPortList'
  static switchRoutedList = 'switchRoutedList'
  static switchProfileList = 'switchProfileList'
  static stackMemberlList = 'stackMemberlList'
}

export interface PortSetting {
  dhcpSnoopingTrust: boolean
  id: string
  ipsg: boolean
  lldpEnable: boolean
  lldpQos: LldpQosModel[]
  poeCapability: boolean
  poeClass: string
  poeEnable: boolean
  poePriority: number
  port: string
  poeBudget?: number
  portEnable: boolean
  portProtected: boolean
  portSpeed: string
  revert: boolean
  rstpAdminEdgePort: boolean
  stpBpduGuard: boolean
  stpRootGuard: boolean
  switchId: string
  switchMac: string
  taggedVlans?: string[]
  untaggedVlan?: number | string
  voiceVlan: number | string
  egressAcl?: string
  ingressAcl?: string
  switchSerialNumber: string
}

export interface PortsSetting {
  requestId: string,
  response: PortSetting[]
}
export interface VePortRouted {
  defaultVlan: boolean
  deviceStatus: string
  dhcpRelayAgent: string
  id: string
  ipAddress: string
  ipAddressType: string
  ipSubnetMask: string
  name: string
  ospfArea: string
  portType: string
  stack: boolean
  switchId:string
  switchName: string
  syncedSwitchConfig: boolean
  veId: number
  vlanId: number
  portNumber: string
}

export interface VePortRoutedResp {
  data: VePortRouted[],
  fields: string[],
  totalCount: number
  totalPages: number
}

export interface SwitchAclUnion {
  profileAcl: string[]
  switchAcl: string[]
}


export interface ProfileVlan {
  defaultVlan: boolean
  profileLevel: boolean
  vlanConfigName?: string
  vlanId: number
  switchId: string
}

export interface SwitchDefaultVlan {
  defaultVlanId: number
  switchId: string
}


export interface SwitchVlan {
  defaultVlan: boolean
  profileLevel: boolean
  vlanConfigName?: string
  switchId: string
  vlanId: number
}

export interface SwitchVlanUnion {
  profileVlan: ProfileVlan[]
  switchDefaultVlan: SwitchVlan[]
  switchVlan: SwitchVlan[]
}

export interface SwitchVlans {
  arpInspection: boolean
  id: string
  igmpSnooping: string
  ipv4DhcpSnooping: boolean
  multicastVersion: number
  spanningTreePriority?: number
  spanningTreeProtocol: string
  vlanId: number
  vlanName: string
}

export interface SwitchProfile {
  acls: Acl[]
  id: string
  name: string
  profileType: string
  venues: string[]
  vlans: Vlan[]
}

export interface SaveSwitchProfile {
  switchId: string,
  port: PortSetting[]
}
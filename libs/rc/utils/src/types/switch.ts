/* eslint-disable max-len */
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
  key?: string
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

export interface VeViewModel {
  name?: string
  dhcpRelayAgent?: string
  defaultVlan: boolean
  deviceStatus: SwitchStatusEnum
  id: string
  ipAddress?: string
  ipAddressType?: IP_ADDRESS_TYPE
  ipSubnetMask?: string
  ospfArea?: string
  stack: boolean
  switchId: string
  switchName?: string
  syncedSwitchConfig: boolean
  veId: number
  vlanId: number
  portTyp : string //ignore
}

export interface VeForm {
  name: string
  veId: number
  vlanId: number
  ospfArea: string
  ipSubnetMask?: string
  ipAddressType?: string
  ipAddress?: string
  egressAcl: string
  ingressAcl: string
  id: string
  dhcpRelayAgent: string
  defaultVlan: boolean
}


export interface VlanVePort {
  usedByVePort: boolean
  vlanId: string
  vlanName?: string
}

export interface AclUnion {
  profileAcl: string[]
  switchAcl: string[]
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
  portsStatus?: {
    Down?: number,
    Up?: number
  }
  venueDescription?: string
  staticOrDynamic?: string
  dns?: string
  unitDetails?: StackMember[]
  firmware?: string
}

export interface SwitchRow {
  id: string
  model: string
  serialNumber: string
  activeSerial: string
  deviceStatus: SwitchStatusEnum
  switchMac: string
  isStack: boolean
  name: string
  venueId: string
  venueName: string
  configReady: boolean
  syncDataEndTime: string
  cliApplied: boolean
  formStacking: boolean
  suspendingDeployTime: string
  uptime?: string
  syncedSwitchConfig?: boolean
  children?: StackMember[]
  isFirstLevel?: boolean
  unitStatus?: STACK_MEMBERSHIP
  syncDataId?: string
  operationalWarning?: boolean
  switchName?: string
}

export interface StackMember {
  venueName: string
  serialNumber: string
  operStatusFound: boolean
  switchMac: string
  activeSerial: string
  id: string
  uptime: string
  order: number
  unitStatus?: STACK_MEMBERSHIP
  unitId?: string
}

export interface ConfigurationHistory {
  switchName: string
  startTime: string
  endTime: string
  serialNumber: string
  configType: string
  dispatchStatus: string
  clis: string
  numberOfErrors: number
  transactionId: string
  dispatchFailedReason?: DispatchFailedReason[]
}

export interface DispatchFailedReason {
  lineNumber: string
  message: string
}


export enum STACK_MEMBERSHIP {
  ACTIVE = 'Active',
  STANDBY = 'Standby',
  MEMBER = 'Member',
}

export interface SwitchTable {
  key: string
  id: string
  order?: number
  active?: boolean
  model: string
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

/* eslint-disable max-len */
import { ConfigurationBackupStatus, PortLabelType, PortTaggedEnum, TrustedPortTypeEnum } from '../constants'
import { NetworkVenue }                                                                  from '../models'
import { PortSettingModel }                                                              from '../models/PortSetting'

import { ProfileTypeEnum }                               from './../constants'
import { Acl, Vlan, SwitchModel, NetworkDevicePosition } from './venue'

import { GridDataRow } from './'

export const SWITCH_SERIAL_PATTERN=/^(FEG|FEM|FEA|FEB|FEH|FEJ|FEC|FED|FEE|FEF|FJN|FJP|FEK|FEL|FMD|FME|FMF|FMG|FMU|FMH|FMJ|EZC|EZD|EZE|FLU|FLV|FLW|FLX|FMK|FML|FMM|FMN|FMP|FMQ|FMR|FMS|FNC|FNF|FND|FNG|FNH|FNM|FNS|FNE|FNJ|FNK|FNL|FNN|FNR)([0-9A-Z]{2})(0[1-9]|[1-4][0-9]|5[0-4])([A-HJ-NP-Z])([0-9A-HJ-NPRSTV-Z]{3})$/i

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

export enum SWITCH_TYPE {
  SWITCH = 'switch',
  ROUTER ='router'
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

export enum TroubleshootingType {
  PING = 'ping',
  TRACE_ROUTE = 'trace-route',
  ROUTE_TABLE = 'route-table',
  MAC_ADDRESS_TABLE = 'mac-address-table',
  DHCP_SERVER_LEASE_TABLE = 'dhcp-server-lease-table'
}

export enum DeviceRequestAction {
  SYNC = 'sync',
  REBOOT = 'reboot',
  SYNC_ADMIN_PASSWORD = 'syncAdminPassword'
}

export enum TroubleshootingMacAddressOptionsEnum {
  PORT = 'connected_port',
  NONE = 'none',
  MAC = 'mac_address',
  VLAN = 'vlan',
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
  serialNumber?: string

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

export interface TroubleshootingResult {
  requestId: string
  response: {
      latestResultResponseTime: string
      result: string
      pingIp: string
      syncing: boolean
      traceRouteTarget: string
      traceRouteTtl: number
      troubleshootingType: TroubleshootingType
      macAddressTablePortIdentify: string
      macAddressTableVlanId: string
      macAddressTableAddress: string,
      macAddressTableType: TroubleshootingMacAddressOptionsEnum,
      dhcpServerLeaseList?: SwitchDhcpLease[]
  }
}

export interface PingSwitch {
  targetHost: string
}

export interface TraceRouteSwitch {
  maxTtl: string
  targetHost: string
}

export interface VeViewModel {
  ingressAclName?: string
  egressAclName?: string
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
  portNumber: string
  portTyp: string //ignore
  inactiveRow?: boolean //ignore
  inactiveTooltip?: string //ignore
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
  unitId = 1
  isStack?: boolean
  deviceStatus?: SwitchStatusEnum
  model?: string
  venueName?: string
  switchType?: SWITCH_TYPE
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
  syncDataEndTime?: string
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
  activeSerial?: string
  syncDataId?: string
  cloudPort?: string
  lastSeenTime?: string
  rearModuleOption?: boolean
  floorplanId?: string
  xPercent?: number
  yPercent?: number
  position?: NetworkDevicePosition
  syncedAdminPassword?: boolean
  adminPassword?: string
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
  children?: StackMember[] | SwitchRow[]
  isFirstLevel?: boolean
  unitStatus?: STACK_MEMBERSHIP
  syncDataId?: string
  operationalWarning?: boolean
  switchName?: string
  firmware?: string
  xPercent?: number
  yPercent?: number
  switches?: SwitchRow[]
  isGroup?: string
  members?: number
  clients?: number
  incidents?: number
  clientCount?: number
  syncedAdminPassword?: boolean
  adminPassword?: string
}

export interface StackMember {
  isFirstLevel: boolean
  venueName: string
  serialNumber: string
  operStatusFound?: boolean
  switchMac: string
  activeSerial: string
  id: string
  uptime: string
  order: string
  unitStatus?: STACK_MEMBERSHIP
  unitId?: number
  model?: string
  deviceStatus?: SwitchStatusEnum
  needAck?: boolean
  newSerialNumber?: string
  children?: SwitchRow
}

export interface StackMemberList {
  activeSerial: string
  deviceStatus: string
  id: string
  model: string
  order: string
  poeFree: number
  poeTotal: number
  poeUtilization: number
  serialNumber: string
  switchMac: string
  unitId: number
  unitName: string
  unitStatus: string
  uptime: string
  venueName: string
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
  numberOfFailed?: number
  numberOfNotifySuccess?: number
  numberOfSuccess?: number
}

export interface ConfigurationBackup {
  id: string
  createdDate: string
  name: string
  backupType: string
  backupName: string
  status: ConfigurationBackupStatus
  backupStatus: ConfigurationBackupStatus
  config: string
  switchId: string
  restoreStatus: ConfigurationBackupStatus
  failureReason: string
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
  disabled: boolean
}

export interface SwitchProfileModel {
  id: string,
  name: string,
  profileType: ProfileTypeEnum,
  venues: string[],
  vlans: SwitchVlans[]
}

export interface SwitchCliTemplateModel{
  applyLater: boolean,
  cli: string,
  id: string,
  name: string,
  reload: boolean,
  venueSwitches?: VenueSwitches[]
}

export interface VenueSwitches {
  switches?: string[]
  id: string
  venueId: string
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
  poeUsage: string;
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
  mediaType?: string;
  portnumber?: string
  usedInUplink?: boolean
}

export interface SwitchPortStatus extends SwitchPortViewModel {
  neighborMacAddress?: string
  portTagged?: PortTaggedEnum
}

export interface SwitchSlot {
  portStatus: SwitchPortStatus[]
  portCount: number
  slotNumber?: number
  isDataPort?: boolean
  fanStatus?: {
    type: string
    status: string
  }
  powerStatus?: {
    type: string
    status: string
  }
}

export interface SwitchPortModuleInfo {
  portLabel: PortLabelType;
}

export interface SwitchModelInfo {
  powerSlots?: number;
  fanSlots?: number;
  portModuleSlots?: SwitchPortModuleInfo[];
}

export interface SwitchModelFamilyInfo {
  [key: string]: SwitchModelInfo;
}

export interface SwitchModelInfoMap {
  [key: string]: SwitchModelFamilyInfo;
}

export interface SwitchFrontView {
  slots: SwitchSlot[]
  unitNumber?: number
}

export interface SwitchRearViewStatus {
  slotNumber: number
  status: string
  type: string
  unit?: number
}

export interface SwitchRearView {
  slotNumber?: number
  fanStatus?: SwitchRearViewStatus[]
  powerStatus?: SwitchRearViewStatus[]
}

export interface SwitchRearViewUI {
  slotNumber?: number
  fanStatus?: SwitchRearViewStatus
  powerStatus?: SwitchRearViewStatus
}

export interface SwitchRearViewUISlot {
  slots: SwitchRearViewUI[]
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

export interface PortsSetting {
  requestId: string,
  response: PortSettingModel[]
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
  profileVlan: SwitchVlan[]
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
  switchFamilyModels: SwitchModel[]
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
  port: PortSettingModel[]
}

export enum DHCP_OPTION_TYPE {
  ASCII = 'ASCII',
  HEX = 'HEX',
  IP = 'IP',
  BOOLEAN = 'BOOLEAN',
  INTEGER = 'INTEGER'
}

export interface SwitchDhcpOption {
  seq: number
  type: DHCP_OPTION_TYPE
  value: string
}

export interface SwitchDhcp {
  id: string
  poolName: string
  leaseDays: number
  leaseHrs: number
  leaseMins: number
  excludedEnd?: string
  excludedStart?: string
  defaultRouterIp?: string
  subnetMask: string
  subnetAddress: string
  dhcpOptions?: SwitchDhcpOption[]
}

export interface SwitchDhcpLease {
  clientId: string
  clientIp: string
  leaseExpiration: string
  leaseType: string
}
export interface PortStatus{
  portNumber: number
  portTagged: string
  unitNumber?: number
}

export interface SwitchSlot2 { //TODO
  slotNumber: number
  enable: boolean
  option: string
  slotPortInfo?: string
  portStatus?: PortStatus[]
}

export interface TrustedPort {
  id?: string
  vlanDemand?: boolean
  model: string
  slots: SwitchSlot2[]
  trustPorts: string[]
  trustedPortType: TrustedPortTypeEnum
}

export interface TaggedVlanPorts {
  vlanId: string
  taggedPorts: string[]
}

export interface VoiceVlanOption {
  model: string
  taggedVlans: TaggedVlanPorts[]
}

export interface VoiceVlanConfig {
  model: string
  voiceVlans: TaggedVlanPorts[]
}

export interface VoiceVlanPort {
  taggedPort: string
  voiceVlan: string
  vlanOptions?: string[]
}

export interface SwitchConfigurationProfile {
  acls: Acl[]
  id: string
  name: string
  profileType: string
  venues: string[]
  vlans: Vlan[]
  description: string
  trustedPorts: TrustedPort[]
  voiceVlanOptions?: VoiceVlanOption[]
  voiceVlanConfigs?: VoiceVlanConfig[]
}

export interface AclStandardRule {
  sequence: number
  action: string
  source: string
  specificSrcNetwork: string
  editIndex?: number
}

export interface AclExtendedRule extends AclStandardRule {
  protocol?: string
  sourcePort?: string
  destination?: string
  destinationPort?: string
  specificDestNetwork?: string
}

export interface SwitchModelPortData {
  id?: string
  vlanDemand?: boolean
  model: string
  slots: SwitchSlot2[]
  taggedPorts: string[]
  untaggedPorts: string[]
}

export interface CliTemplateExample {
  id: string
  name: string
  cli: string
  version: string
}

export interface CliTemplateVariable {
  name: string
  type: string
  value: string
}

export interface CliTemplateVenueSwitches {
  id: string
  venueId?: string
  switches: string[]
}

export interface ApplySwitch {
  id: string
  name?: string
  venueName: string
}

export interface CliConfiguration {
  id?: string
  name?: string
  cli?: string
  cliValid?: {
    tooltip: string
    valid: boolean
  }
  reload?: boolean
  applyNow?: boolean
  applyLater?: boolean
  applySwitch?: ApplySwitch[]
  venueSwitches?: CliTemplateVenueSwitches[]
  variables?: CliTemplateVariable[]

  // profile
  overwrite?: boolean
  venues?: string[]
  models?: string[]
  venueCliTemplate?: {
		cli?: string,
		id?: string,
		name?: string,
		overwrite?: boolean
    switchModels?: string
    variables?: CliTemplateVariable[]
	}
}

export interface FamilyModels {
  family: string,
  models: {
    model: string
    checked: boolean
  }[]
}

export interface CliFamilyModels {
  familyModels: FamilyModels[]
  venueId: string
  venueName: string
}

export enum LAG_TYPE {
  STATIC = 'static',
  DYNAMIC = 'dynamic'
}

export interface Lag {
  id?: string
  lagId?: number
  name: string
  ports: string[]
  realRemove?: boolean
  switchId: string
  taggedVlans: string[]
  type: LAG_TYPE
  untaggedVlan: string
}

export interface SchedulingModalState {
  visible: boolean,
  networkVenue?: NetworkVenue,
  venue?: {
    latitude: string,
    longitude: string,
    name: string
  }
}
export interface AclStandardRule {
  sequence: number
  action: string
  source: string
  specificSrcNetwork: string
  editIndex?: number
}

export interface CliProfileModel{
  model: string,
  checked: boolean
}

export interface CliProfileFamily {
  family: string,
  model: CliProfileModel[]
}

/* eslint-disable max-len */
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

export interface SwitchStack {
  key: string,
  id: string,
	activeSerial: string,
	venueName: string,
	serialNumber: string,
  order?: number,
  model: string
}
import { APMeshRole } from '../constants'
import { DeviceGps }  from '../models/DeviceGps'

import { ApVenueStatusEnum } from '.'

export interface APRadio {
  channel?: number,
  band: string,
  radioId: number,
  txPower?: string,
  Rssi: string
}
export interface AP {
  IP?: string
  apMac?: string
  apStatusData?: {
    APRadio?: Array<RadioProperties>
    cellularInfo: CelluarInfo
    APSystem?: {
      uptime?: number
    }
  },
  clients?: number
  deviceGroupId: string
  deviceGroupName?: string
  deviceStatus: string
  meshRole: string
  model: string
  name?: string
  serialNumber: string
  tags: string
  venueId: string
  venueName: string
  description?: string
  deviceGps?: DeviceGps
  deviceStatusSeverity?: ApVenueStatusEnum,
  lastSeenTime?: string
  uptime?: string
}

export interface ApViewModel extends AP {
  channel24?: RadioProperties
  channel50?: RadioProperties
  channelL50?: RadioProperties
  channelU50?: RadioProperties
  channel60?: RadioProperties
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
  cellularIsSIM1Present: string
  cellularIMSISIM1: string
  cellularICCIDSIM1: string
  cellularTxBytesSIM1: string
  cellularRxBytesSIM1: string
  cellularSwitchCountSIM1: string
  cellularNWLostCountSIM1: string
  cellularCardRemovalCountSIM1: string
  cellularDHCPTimeoutCountSIM: string
  cellularActiveSim: string
  cellularConnectionStatus: string
  cellularSignalStrength: string
}

export interface ApDetails {
  IP?: string
  apMac?: string
  apStatusData?: {
    APRadio?: Array<APRadio>
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
  description:string
  deviceGps: {
    latitude: string,
    longitude:string
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
export interface APMesh {
  IP?: string
  apMac?: string
  apStatusData?: {
    APRadio?: Array<APRadio>
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
  upMac?: string
}
interface Uplink{
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
	type?: 'ACCESS' | 'GENERAL' | 'TRUNK'
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
	trunkPortOnly?: boolean,
	requireOneEnabledTrunkPort: boolean,
	simCardPrimaryEnabled: boolean,
	simCardPrimaryRoaming: boolean,
	simCardSecondaryEnabled: boolean,
	simCardSecondaryRoaming: boolean,
	supportChannel144: boolean,
	supportDual5gMode: boolean,
	supportTriRadio: boolean
}

export interface RadioProperties {
  Rssi: string;
  txPower: string;
  channel: string;
  band?: string;
  radioId?: number
  operativeChannelBandwidth?: string
}

export enum GpsFieldStatus {
  INITIAL,
  FROM_VENUE,
  MANUAL
}

export interface ApLanPort {
  lanPorts: LanPort[]
  useVenueSettings: boolean
}

export interface ApRadio {
  enable24G: boolean
  enable50G: boolean
  useVenueSettings: boolean
}
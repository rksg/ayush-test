import { APMeshRole } from '../constants'

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
  venueName: string
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
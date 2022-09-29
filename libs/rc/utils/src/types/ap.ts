
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

export interface LanPort {
	defaultType: string
	id: string
	isPoeOutPort: boolean
	isPoePort: boolean
	supportDisable: boolean
	trunkPortOnly: boolean
	untagId: number
	vlanMembers: string
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
	requireOneEnabledTrunkPort: boolean,
	simCardPrimaryEnabled: boolean,
	simCardPrimaryRoaming: boolean,
	simCardSecondaryEnabled: boolean,
	simCardSecondaryRoaming: boolean,
	supportChannel144: boolean,
	supportDual5gMode: boolean,
	supportTriRadio: boolean
}
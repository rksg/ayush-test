import { Key } from 'react'

import { CellularNetworkSelectionEnum, LteBandRegionEnum, WanConnectionEnum } from '../constants'

import { ApStatusDetails, ApModel } from './ap'

import { ApVenueStatusEnum, SwitchStatusEnum } from './index'

export interface VenueDetailHeader {
	activeLteNetworkCount: number,
	activeNetworkCount: number,
	aps: {
		summary: {
			[key in ApVenueStatusEnum]?: number
    },
		totalApCount: number,
		detail: {
			[key in ApVenueStatusEnum]?: ApStatusDetails[]
    }
	},
	lteAps: {
		summary: {
      [key in ApVenueStatusEnum]?: number
    },
		totalApCount: number,
		detail: {
      [key in ApVenueStatusEnum]?: ApStatusDetails[]
    }
	},
	switchClients: {
		totalCount: number
	},
	switches: {
		summary: {
			[key in SwitchStatusEnum]?: number
		},
		totalCount: number
	},
	totalClientCount: string
	venue: VenueDetail
}

export interface VenueDetail {
	addressLine: string,
	city: string,
	country: string,
	crtTime: string,
	id: string,
	lastUpdTime: string,
	latitude: string,
	longitude: string,
	name: string,
	tenantId: string,
	timeZone: string,
	type: string,
	venueStatus: string
}

export interface FloorPlanDto {
  id: string;
	name: string;
	floorNumber: number,
	image: FloorPlanImage,
	imageId?: string,
	imageUrl?: string,
	imageBlob?: string, //used for SVG
	imageName?: string
}

export interface FloorPlanImage {
	id: string,
	name: string
}

export interface VenueCapabilities {
	apModels: ApModel[]
	version: string
}
export interface VenueLed {
	ledEnabled: boolean
	model: string,
	key?: string,
	manual?: boolean
}

export interface VenueApModels {
	models: string[]
}

export interface VenueSwitchConfiguration {
	cliApplied?: boolean,
	id?: string,
	name?: string,
	profileId: Key[],
	dns?: string[],
	switchLoginPassword?: string,
	switchLoginUsername?: string,
	syslogEnabled: boolean,
	syslogPrimaryServer?: string,
  syslogSecondaryServer?: string
}

export interface AclRule {
	id: string,
	source: string,
	destination: string,
	sequence: number
	action: 'permit' | 'deny',
	protocol: 'ip' | 'tcp' | 'udp'
}

export interface Acl {
	aclType: 'standard' | 'extended'
	id: string,
	name: string,
	aclRules: AclRule[]
}

export interface SwitchModelSlot {
	slotNumber: number,
	enable: boolean,
	option?: string
}

export interface SwitchModel {
	id: string,
	model: string,
	slots: SwitchModelSlot[],
  taggedPorts?: string,
  untaggedPorts?: string
}

export interface Vlan {
	arpInspection: boolean,
	id: string,
	igmpSnooping: 'active' | 'passive' | 'none'
	ipv4DhcpSnooping: boolean,
	multicastVersion: number,
	spanningTreePriority: number,
	spanningTreeProtocol: 'rstp' | 'stp' | 'none',
	switchFamilyModels?: SwitchModel[]
	vlanId: number,
	vlanName?: string
}

export interface ConfigurationProfile {
	id: string,
	name: string,
	profileType: 'Regular' | 'CLI',
	venueCliTemplate?: {
		cli: string,
		id: string,
		name: string,
		overwrite: boolean
		switchModels?: string
	}
	vlans?: Vlan[],
	acls?: Acl[],
	venues?: string[]
}

export interface AvailableLteBands {
	band3G?: string[],  
	band4G?: string[],  
	region: LteBandRegionEnum,
	countryCodes?: string[]
  }

export interface VenueApModelCellular {
	model?: string,
	primarySim: SimSettings,
	secondarySim: SimSettings,
	wanConnection?: WanConnectionEnum,
	primaryWanRecoveryTimer: number
  }

export interface SimSettings {
	lteBands?: LteBandLockChannel[];
	enabled?: boolean;
	apn?: string;
	roaming?: boolean;
	networkSelection?: CellularNetworkSelectionEnum;
}

export interface LteBandLockChannel {
	band3G?: string[];
	band4G?: string[];
	region: LteBandRegionEnum;
}

export interface AvailableLteBandOptions {
	value: string, 
	label: string
}

export interface LteBandLockCountriesJson {
	[LteBandRegionEnum.DOMAIN_1]: { name: string, countries: string },
	[LteBandRegionEnum.DOMAIN_2]: { name: string, countries: string },
	[LteBandRegionEnum.JAPAN]: { name: string, countries: string },
	[LteBandRegionEnum.USA_CANADA]: { name: string, countries: string }
}
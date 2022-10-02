

import { BandBalancing }             from '../models/BandBalancing'
import { DenialOfServiceProtection } from '../models/DenialOfServiceProtection'
import { LteBandLockChannel }        from '../models/LteBandLockChannel'
import { Mesh }                      from '../models/Mesh'
import { VenueDhcpServiceSetting }   from '../models/VenueDhcpServiceSetting'
import { VenueRadioCustomization }   from '../models/VenueRadioCustomization'
import { VenueRogueAp }              from '../models/VenueRogueAp'
import { VenueSyslog }               from '../models/VenueSyslog'

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

    
export interface Address {
  addressLine?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  notes?: string
  timezone?: string
}

export interface MeshOptions {
  enabled: boolean
}

export interface DhcpOptions {
  enabled: boolean
  mode: DhcpModeEnum
}

enum DhcpModeEnum {
  DHCPMODE_EACH_AP = 'DHCPMODE_EACH_AP',
  DHCPMODE_MULTIPLE_AP = 'DHCPMODE_MULTIPLE_AP',
  DHCPMODE_HIERARCHICAL_AP = 'DHCPMODE_HIERARCHICAL_AP'
}

export interface VenueExtended {
  name: string
  description?: string
  notes?: string
  address: Address
  latitude?: number
  longitude?: number
  networkCount?: number
  apCount?: number
  clientCount?: number
  activeNetworksToolTip?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activatedNetworks?: Array<any>
  disabledActivation?: boolean
  allApDisabled?: boolean
  dataFulfilled?: boolean
  disabledBySSIDActivated?: boolean
  disableByMaxReached?: boolean
  mesh: MeshOptions
  dhcp: DhcpOptions
  id?: string
}

export interface VenueSettings {
  tenantId?: string
  wifiFirmwareVersion?: string
  countryCode?: string
  apPassword?: string
  mesh: Mesh
  bandBalancing: BandBalancing
  radioCustomization: VenueRadioCustomization
  denialOfServiceProtection: DenialOfServiceProtection
  syslog: VenueSyslog
  dhcpServiceSetting: VenueDhcpServiceSetting
  lteBandLockChannels?: LteBandLockChannel[]
  rogueAp: VenueRogueAp
  enableClientIsolationAllowlist?: boolean
  id?: string
}

export interface VenueNetworking {
  mesh?: boolean
  cellular?: any
}
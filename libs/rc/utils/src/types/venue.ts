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
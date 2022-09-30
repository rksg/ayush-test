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

export enum AAAServerTypeEnum {
  RADIUS = 'RADIUS',
  TACACS = 'TACACS_PLUS',
	LOCAL_USER = 'LOCAL'
}

export enum AAA_SERVER_TYPE {
  RADIUS = 'RADIUS',
  TACACS = 'TACACS_PLUS',
  LOCAL = 'LOCAL',
  NONE = 'NONE_TYPE'
}

export interface AAASetting {
	authnEnabledSsh: boolean,
	authnEnableTelnet: boolean,
	authnFirstPref: AAAServerTypeEnum,
	authnSecondPref?: AAA_SERVER_TYPE,
	authzCommonsFirstServer?: AAAServerTypeEnum,
	authzCommonsSecondServer?: AAA_SERVER_TYPE,
	authzExecFirstServer?: AAAServerTypeEnum,
	authzExecSecondServer?: AAA_SERVER_TYPE,
	acctCommonsFirstServer?: AAAServerTypeEnum,
	acctCommonsSecondServer?: AAA_SERVER_TYPE,
	acctExecFirstServer?: AAAServerTypeEnum,
	acctExecSecondServer?: AAA_SERVER_TYPE,
	authzEnabledCommand: boolean,
	authzEnabledExec: boolean,
	acctEnabledCommand: boolean,
	acctEnabledExec: boolean,
	id: string
}

export interface RadiusServer {
  serverType: AAAServerTypeEnum,
  id: string,
  name: string,
  ip: string,
  authPort: number,
  acctPort: number,
  secret: string
}

export interface TacacsServer {
  serverType: AAAServerTypeEnum,
  id: string,
  name: string,
  ip: string,
  authPort: number,
  purpose: string,
  secret: string
}

export interface LocalUser {
  serverType: AAAServerTypeEnum,
  id: string,
  level: string,
  name: string,
  username: string,
  password: string,
  authPort: number,
  purpose: string
}
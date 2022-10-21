import { Key } from 'react'

import { CellularNetworkSelectionEnum, LteBandRegionEnum, WanConnectionEnum } from '../constants'
import { BandBalancing }                                                      from '../models/BandBalancing'
import { DenialOfServiceProtection }                                          from '../models/DenialOfServiceProtection'
import { Mesh }                                                               from '../models/Mesh'
import { VenueDhcpServiceSetting }                                            from '../models/VenueDhcpServiceSetting'
import { VenueRadioCustomization }                                            from '../models/VenueRadioCustomization'
import { VenueRogueAp }                                                       from '../models/VenueRogueAp'
import { VenueSyslog }                                                        from '../models/VenueSyslog'


import { ApStatusDetails, ApModel, LanPort } from './ap'

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

export interface VenueLanPorts {
	model: string,
	lanPorts: LanPort[],
	poeMode?: string,
	poeOut?: boolean
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

export interface VenueDosProtection {
  blockingPeriod: number
  checkPeriod: number
  enabled: boolean
  failThreshold: number
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
import { Key } from 'react'

import { APMeshRole, ApDeviceStatusEnum, CellularNetworkSelectionEnum, LteBandRegionEnum, WanConnectionEnum } from '../constants'
import { BandBalancing }                                                                                      from '../models/BandBalancing'
import { DenialOfServiceProtection }                                                                          from '../models/DenialOfServiceProtection'
import { Mesh }                                                                                               from '../models/Mesh'
import { VenueDhcpServiceSetting }                                                                            from '../models/VenueDhcpServiceSetting'
import { VenueRadioCustomization }                                                                            from '../models/VenueRadioCustomization'
import { VenueRogueAp }                                                                                       from '../models/VenueRogueAp'
import { VenueSyslog }                                                                                        from '../models/VenueSyslog'


import { ApStatusDetails, LanPort }                  from './ap'
import { RogueCategory }                             from './policies'
import { ConfigurationHistory, CliTemplateVariable } from './switch'

import { ApVenueStatusEnum, EdgeStatusSeverityStatistic, SwitchStatusEnum } from './index'



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
	edges: EdgeStatusSeverityStatistic,
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

export interface TypeWiseNetworkDevices {
	ap: NetworkDevice[];
	switches: NetworkDevice[];
	LTEAP: NetworkDevice[];
	RogueAP: NetworkDevice[];
	cloudpath: NetworkDevice[];
	DP: NetworkDevice[];
}

export enum FloorplanContext {
	venue = 'Venue',
	album = 'Album',
	unplaced = 'Unplaced',
	ap = 'Ap',
	switch = 'Switch',
	lte_ap = 'LteAp',
	rogue_ap = 'RogueAp',
	cloudpath = 'Cloudpath'
  }

export interface APStatus {
	message: string;
	icon: string;
	color: string;
  }

export interface NetworkDevicePayload {
	fields: string[];
	pageSize: number;
	sortField: string;
	sortOrder: string;
}

export enum NetworkDeviceType {
	ap = 'ap',
	switch = 'switches',
	lte_ap = 'LTEAP',
	rogue_ap = 'RogueAP',
	cloudpath = 'cloudpath',
	dp = 'DP'
}
export interface NetworkDevice {
    id?: string; // used by devices type other than AP & switch
	name: string;
	switchName?: string;
	deviceStatus: ApDeviceStatusEnum | SwitchStatusEnum;
	networkDeviceType: NetworkDeviceType;
	serialNumber: string;
	floorplanId?: string;
	xPercent?: number;
	yPercent?: number;
	position?: NetworkDevicePosition;
	isActive?: boolean;
	rogueCategory?: Record<RogueCategory, number>;
	snr?: number;
	macAddress?: string;
	rogueCategoryType?: RogueDeviceCategoryType;
	apMac?: string;
	switchMac?: string;
  meshRole?: APMeshRole;
}

export interface RogueApInfo {
	deviceColor: string;
    rogueSnrClass?: string;
    rogueApTooltips?: string;
	allrogueApTooltipRequired?: boolean;
	allVenueRogueApTooltipAttr?: AllVenueRogueApTooltipAttr,
	specificRogueApTooltipAttr?: SpecificRogueApTooltipAttr,
    drawRogueApItem?: boolean;
    showRogueTotalNumber?: boolean;
}

export interface AllVenueRogueApTooltipAttr {
	totalRogueNumber: number,
    deviceName: string,
    categoryNames: string[],
	categoryNums?: number[];
}

export interface SpecificRogueApTooltipAttr{
	activatedBarIndex: number,
	deviceName: string,
	macAddress: string,
	snr: number
}

export enum RogueDeviceCategoryType {
	malicious = 'Malicious',
	ignored = 'Ignored',
	unclassified = 'Unclassified',
	known = 'Known'
}

export interface NetworkDevicePosition {
	floorplanId?: string;
	xPercent?: number;
	yPercent?: number;
	x?: number;
	y?: number;
}
export interface NetworkDeviceResponse {
	fields: string[];
	totalCount: number;
	page: number;
	data: { [key in NetworkDeviceType ]: NetworkDevice[] }[];
}

export interface FloorPlanImage {
	id: string,
	name: string
}

export interface UploadUrlResponse {
	fileId: string;
	signedUrl: string;
}
export interface FloorPlanFormDto {
	floorNumber: number;
	id?: string;
	imageId?: string;
	imageName: string;
	name: string;
}

export interface FileValidation {
	file: File,
	isValidfileType: boolean,
	isValidFileSize: boolean
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
  countryCode?: string
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
	id?: string,
	country: string,
  version?: string
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
	destination?: string,
	sequence: number
	action: 'permit' | 'deny',
	protocol: 'ip' | 'tcp' | 'udp'
	specificSrcNetwork?: string
	specificDestNetwork?: string
	sourcePort?: string | null
	destinationPort?: string | null
}

export interface Acl {
	aclType: 'standard' | 'extended'
	id: string,
	name: string,
	aclRules: AclRule[]
}

export interface JwtToken {
	access_token: string,
	expires_in: string,
	id_token: string,
	type: string
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
	arpInspection?: boolean,
	id: string,
	igmpSnooping?: 'active' | 'passive' | 'none'
	ipv4DhcpSnooping?: boolean,
	multicastVersion?: number,
	spanningTreePriority?: number,
	spanningTreeProtocol: 'rstp' | 'stp' | 'none',
	switchFamilyModels?: SwitchModel[]
	vlanId: number,
	vlanName?: string,
  untaggedPorts?: string,
  taggedPorts?: string,
  title?: string
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
		variables?: CliTemplateVariable[]
	}
	vlans?: Vlan[],
	acls?: Acl[],
	venues?: string[]
}
export interface TriBandSettings {
  enabled: boolean
}
export interface VenueDefaultRegulatoryChannels {
  '2.4GChannels': {
    [key: string]: string[]
  },
  '5GChannels': {
    dfs: {
      [key: string]: string[]
    },
    indoor: {
      [key: string]: string[]
    },
    outdoor: {
      [key: string]: string[]
    }
  },
  '5GLowerChannels': {
    dfs: {
      [key: string]: string[]
    },
    indoor: {
      [key: string]: string[]
    },
    outdoor: {
      [key: string]: string[]
    }
  },
  '5GUpperChannels': {
    dfs: {
      [key: string]: string[]
    },
    indoor: {
      [key: string]: string[]
		},
    outdoor: {
      [key: string]: string[]
    }
  },
  '6GChannels': {
    [key: string]: string[]
  }
}

export interface VenueDefaultRegulatoryChannelsForm {
	radioParams24G: {
		allowedChannels: string[],
		channelBandwidth: string,
		method: string,
		changeInterval: number,
		scanInterval: number,
		txPower: string
	},
	radioParams50G: {
		combineChannels: boolean,
		allowedIndoorChannels: string[],
		allowedOutdoorChannels: string[],
		channelBandwidth: string,
		method: string,
		changeInterval: number,
		scanInterval: number,
		txPower: string
	},
	radioParamsDual5G?: {
		enabled: boolean,
		inheritParamsLower5G?: boolean,
		radioParamsLower5G?: {
			combineChannels: boolean,
			allowedIndoorChannels: string[],
			allowedOutdoorChannels: string[],
			channelBandwidth: string,
			method: string,
			changeInterval: number,
			scanInterval: number,
			txPower: string
		},
		inheritParamsUpper5G?: boolean,
		radioParamsUpper5G?: {
			combineChannels: boolean,
			allowedIndoorChannels: string[],
			allowedOutdoorChannels: string[],
			channelBandwidth: string,
			method: string,
			changeInterval: number,
			scanInterval: number,
			txPower: string
		}
	},
	radioParams6G?: {
		method: string,
		scanInterval: number,
		allowedChannels: string[],
		channelBandwidth: string,
		bssMinRate6G: string,
		mgmtTxRate6G: string,
		changeInterval: number,
		txPower: string
	}
}

export interface ApRadioChannelsForm {
	apRadioParams24G: {
		allowedChannels: string[],
		changeInterval: number,
		channelBandwidth: string,
		manualChannel: number,
		method: string,
		txPower: string
	},
	apRadioParams50G: {
		allowedChannels: string[],
		changeInterval: number,
		channelBandwidth: string,
		manualChannel: number,
		method: string,
		txPower: string
	},
	apRadioParams6G: {
		bssMinRate6G: string,
		changeInterval: number,
		channelBandwidth: string,
		manualChannel: number,
		method: string,
		mgmtTxRate6G: string,
		txPower: string
	},
	apRadioParamsDual5G: {
		enabled: boolean,
		lower5gEnabled: boolean,
		radioParamsLower5G: {
			changeInterval: number,
			channelBandwidth: string,
			manualChannel: number,
			method: string,
			txPower: string
		},
		radioParamsUpper5G: {
			changeInterval: number,
			channelBandwidth: string,
			manualChannel: number,
			method: string,
			txPower: string
		},
		upper5gEnabled: boolean
  },
  enable6G: boolean,
  enable24G: boolean,
  enable50G: boolean,
  useVenueSettings: boolean
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
  authnThirdPref?: AAA_SERVER_TYPE,
  authnFourthPref?: AAA_SERVER_TYPE,
  authzCommonsFirstServer?: AAAServerTypeEnum,
  authzCommonsSecondServer?: AAA_SERVER_TYPE,
  authzCommonsThirdServer?: AAA_SERVER_TYPE,
  authzExecFirstServer?: AAAServerTypeEnum,
  authzExecSecondServer?: AAA_SERVER_TYPE,
  authzExecThirdServer?: AAA_SERVER_TYPE,
  acctCommonsFirstServer?: AAAServerTypeEnum,
  acctCommonsSecondServer?: AAA_SERVER_TYPE,
  acctCommonsThirdServer?: AAA_SERVER_TYPE,
  acctExecFirstServer?: AAAServerTypeEnum,
  acctExecSecondServer?: AAA_SERVER_TYPE,
  acctExecThirdServer?: AAA_SERVER_TYPE,
  authzEnabledCommand: boolean,
  authzEnabledExec: boolean,
  acctEnabledCommand: boolean,
  acctEnabledExec: boolean,
  authzCommonsLevel?: string,
  acctCommonsLevel?: string,
  id: string
}

export interface RadiusServer {
  serverType: AAAServerTypeEnum,
  id: string,
	name: string,
	username?: string,
  ip: string,
  authPort: number,
  acctPort: number,
  secret: string
}

export interface TacacsServer {
  serverType: AAAServerTypeEnum,
  id: string,
	name: string,
	username?: string,
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

export interface VenueDirectedMulticast {
  wiredEnabled: boolean,
  wirelessEnabled: boolean,
  networkEnabled: boolean
}

export interface VenueConfigHistoryDetailResp {
	response: {
		list: ConfigurationHistory[]
	}
}

export enum LoadBalancingMethodEnum {
  CLIENT_COUNT = 'BASED_ON_CLIENT_COUNT',
  CAPCITY = 'BASED_ON_CAPACITY'
}

export enum SteeringModeEnum {
  BASIC = 'BASIC',
  PROACTIVE = 'PROACTIVE',
  STRICT = 'STRICT'
}

export interface VenueLoadBalancing {
  enabled: boolean,
  loadBalancingMethod: LoadBalancingMethodEnum,
  bandBalancingEnabled: true,
  bandBalancingClientPercent24G: number,
  steeringMode: SteeringModeEnum
}

export interface VenueClientAdmissionControl {
	enable24G: boolean,
	enable50G: boolean,
	minClientCount24G?: number,
	minClientCount50G?: number,
	maxRadioLoad24G?: number,
	maxRadioLoad50G?: number,
	minClientThroughput24G?: number,
	minClientThroughput50G?: number
  }

export interface Node {
    type?: DeviceTypes;
    name: string;
    category: number | string;
    id?: string;
    mac?: string;
    serial?: string;
    serialNumber?: string;
    states?: DeviceStates,
    childCount?: number;
    symbol?: string;
    symbolOffset?: Array<number>;
	status?: DeviceStatus;
	label?: string;
	cloudPort?: string;
}

export interface UINode {
	id: string,
    label?: string,
    config: Node,
    depth?: number,
    expanded?: boolean,
	x?: number,
	y?: number
}
export interface Link {
	id?: string;
    source: string;
    target: string;
	from: string;
    to: string;
    connectionType?: string;
    connectionStatus?: ConnectionStatus; // this needs to be enum
    connectionStates?: ConnectionStates; // this needs to be enum
    poeEnabled?: boolean;
    linkSpeed?: string;
    poeUsed?: number;
    poeTotal?: number;
    connectedPort?: string;
	angle?: number;
}
export interface GraphData {
    type: string;
    categories: Array<Object>;
    nodes: Array<Node>;
    edges: Array<Link>;
}

export interface TopologyData {
	nodes: Array<Node>;
    edges: Array<Link>;
}

export enum ConnectionStatus {
	Good='Good',
    Degraded='Degraded',
    Unknown='Unknown'
}

export enum DeviceStatus {
	Operational='Operational',
	Disconnected='Disconnected',
	Degraded='Degraded',
    Unknown='Unknown'
}

export enum DeviceStates {
	Regular='Regular',
	Hover='Hover',
}

export enum ConnectionStates {
	Regular='Regular',
	Hover='Hover',
}

export enum DeviceTypes {
	Switch='Switch',
	SwitchStack='SwitchStack',
	Ap='Ap',
	ApWired='ApWired',
	ApMeshRoot='ApMeshRoot',
	ApMesh='ApMesh',
	Unknown='Unknown',
	Cloud='Cloud'
}

export interface MdnsFencingWirelessRule {
  fencingRange: string//'SAME_AP' | 'ONE_HOP_AP'
}

export interface MdnsFencingWiredRule {
  name: string,
  fencingRange: string, //'SAME_AP' | 'ONE_HOP_AP',
  closestApMac: string,
  deviceMacAddresses: string[]
}

export interface MdnsFencingService {
  service: string,
  customServiceName?: string,
  description: string,
  wirelessEnabled: boolean,
  wirelessRule?: MdnsFencingWirelessRule,
  wiredEnabled: boolean,
  wiredRules?: MdnsFencingWiredRule[],
  customMappingEnabled: boolean,
  customStrings?: string[],
  rowId?: string
}

export interface VenueMdnsFencingPolicy {
  enabled: boolean,
  services?: MdnsFencingService[]
}

export enum ShowTopologyFloorplanOn {
	VENUE_OVERVIEW='VENUE_OVERVIEW',
	AP_OVERVIEW='AP_OVERVIEW',
	SWITCH_OVERVIEW='SWITCH_OVERVIEW'
}

export type ApMeshLink = {
  connectionType: 'Wired' | 'Mesh'
  from: string
  to: string
  fromMac: string
  toMac: string
  fromName: string
  toName: string
  fromRole: APMeshRole
  toRole: APMeshRole
  fromSNR: number
  toSNR: number
  band: string
  channel: number
}

export interface ApMeshTopologyData {
  nodes: Node[]
  edges: ApMeshLink[]
}

export enum SignalStrengthLevel {
  EXCELLENT,
  GOOD,
  LOW,
  POOR
}

import { defineMessage } from 'react-intl'

import { EnforceableFields } from '..'
import {
  ServiceAdminState,
  ServiceStatus,
  ServiceType,
  ApDeviceStatusEnum,
  QosPriorityEnum
} from '../constants'
import { EdgeStatusSeverityEnum } from '../models'
import { NetworkVenue }           from '../models/NetworkVenue'
import { TrustedCAChain }         from '../models/TrustedCAChain'

import { CapabilitiesApModel }                   from './ap'
import { EdgeStatusSeverityStatistic }           from './edge'
import { EPDG }                                  from './services'
import { SwitchPortViewModel, SwitchStatusEnum } from './switch'

export * from './common'
export * from './ap'
export * from './venue'
export * from './network'
export * from './any-network'
export * from './services'
export * from './policies'
export * from './msp'
export * from './license'
export * from './edge'
export * from './edgeOlt'
export * from './iot'
export * from './client'
export * from './components'
export * from './switch'
export * from './administration'
export * from './firmware'
export * from './migration'
export * from './timeline'
export * from './persona'
export * from './radiusClientConfig'
export * from './msgTemplate'
export * from './property'
export * from './googleMaps'
export * from './applicationPolicy'
export * from './configTemplate'
export * from './topology'
export * from './mDnsFencingServie'
export * from './ruckusAi'

export interface CommonResult {
  requestId: string
  response?: {
    id?: string
  }
}

export interface CommonErrorsResult<T> {
  data: {
    errors: T[];
    requestId: string;
  };
  status: number;
}

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

export interface Venue extends EnforceableFields {
  id: string
  venueId?: string
  name: string
  description: string
  status: string
  city: string
  country: string
  countryCode?: string
  latitude: string
  longitude: string
  mesh: { enabled: boolean }
  aggregatedApStatus: Partial<Record<ApDeviceStatusEnum, number>>
  networks: {
    count: number
    names: string[]
    vlans: number[]
  }
  wlan: {
    wlanSecurity: string
  }
  allApDisabled: boolean
  // aps ??
  switches?: number
  operationalSwitches?: number
  switchClients?: number
  // radios ??
  // scheduling ??
  activated: { isActivated: boolean, isDisabled?: boolean }
  deepVenue?: NetworkVenue
  disabledActivation: boolean
  networkId? : string
  vlanPoolId?: string
  activatedApsId?: string[]
  dhcp?: { enabled: boolean }
  clients?: number
  apWiredClients?: number
  edges?: number,
  incompatible?: number
  incompatibleEdges?: number // GUI only
  addressLine?: string
  tagList: string[]
}

export interface AlarmBase {
  startTime: number
  severity: string
  message: string
  id: string
  serialNumber: string
  entityType: string
  entityId: string
  sourceType: string,
  switchMacAddress: string,
  clearTime?: string,
  clearedBy?: string
}

export interface AlarmMeta {
  id: AlarmBase['id']
  venueName: string
  apName: string
  switchName: string
  isSwitchExists: boolean
  edgeName: string
}

export enum RWGStatusEnum {
  RWG_STATUS_UNKNOWN = 'RWG_STATUS_UNKNOWN',
  STAGING = 'STAGING',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  INVALID_APIKEY = 'INVALID_APIKEY',
  INVALID_HOSTNAME = 'INVALID_HOSTNAME',
  INVALID_CERTIFICATE = 'INVALID_CERTIFICATE',
  INVALID_LICENSE = 'INVALID_LICENSE',
  INSUFFICIENT_LICENSE = 'INSUFFICIENT_LICENSE',
  DATA_INCOMPLETE = 'DATA_INCOMPLETE'
}

export interface RWG {
  name: string
  status: RWGStatusEnum
  venueId: string
  venueName: string
  hostname: string
  apiKey: string
  rwgId: string
  clusterNodes?: RWGClusterNode[]
  isCluster: boolean,
  floorplanId?: string,
  xPercent?: number,
  yPercent?: number,
  x?: number,
  y?: number
}

export interface RWGClusterNode{
  id: string
  name: string
  ip: string
}

export interface RWGRow extends RWG {
  clusterId?: string
  clusterName?: string
  isNode?: boolean
  children?: RWGRow[]
  ip?: string
  rowId?: string
}

export interface GatewayAlarms {
  data: GatewayAlarm[],
  totalCount: number,
  page: number
}
export interface GatewayAlarm {
  createdAt: string,
  curedAt: string,
  curedShortMessage: string,
  name: string,
  severity: string,
  shortMessage: string,
  updatedAt: string
}
export interface MinMaxValue {
  max: number,
  value: number,
  min: number
}

export interface GatewayDashboard {
  cpuPercentage: MinMaxValue,
  memoryInMb: MinMaxValue,
  temperatureInCelsius: MinMaxValue,
  storageInGb: MinMaxValue
}

export interface GatewayTopProcess {
  processName: string,
  cpu: string,
  memory: string,
  time: string
}

export interface GatewayFileSystem {
  partition: string,
  size: number,
  used: number,
  free: number,
  capacity: string
}
export interface GatewayDetailsGeneral {
  venueName: string,
  venueId: string,
  hostname: string,
  apiKey: string,
  uptimeInSeconds: string,
  bootedAt: string,
  temperature: string,
  created: string,
  updated: string
}

export interface GatewayDetailsHardware {
  baseboardManufacturer: string,
  baseboardProductName: string,
  baseboardSerialNumber: string,
  baseboardVersion: string,
  biosVendor: string,
  biosVersion: string,
  biosReleaseDate: string,
  chassisManufacturer: string,
  chassisSerialNumber: string,
  chassisType: string,
  chassisVersion: string,
  processorFamily: string,
  processorFrequency: string,
  systemManufacturer: string,
  systemProductName: string,
  systemSerialNumber: string,
  systemUuid: string,
  systemVersion: string,
  systemFamily: string
}

export interface GatewayDetailsDiskMemory {
  diskDevice: string,
  diskTotalSpaceInGb: number,
  memoryTotalSpaceInMb: number,
  memoryUsedSpaceInMb: number,
  memoryFreeSpaceInMb: number,
  processorCount: number
}

export interface GatewayDetails {
  gatewayDetailsGeneral: GatewayDetailsGeneral
  gatewayDetailsHardware: GatewayDetailsHardware
  gatewayDetailsDiskMemory: GatewayDetailsDiskMemory
}

export type Alarm = AlarmBase & AlarmMeta

export enum EventSeverityEnum {
  CRITICAL = 'Critical',
  MAJOR = 'Major',
  MINOR = 'Minor',
  WARNING = 'Warning',
  INFORMATIONAL = 'Info'
}

export enum EventTypeEnum {
  AP = 'AP',
  CLIENT = 'CLIENT',
  SWITCH = 'SWITCH',
  NETWORK = 'NETWORK',
  NOTIFICATION = 'Notification',
  DP = 'DP',
  EDGE = 'EDGE'
}

export enum AlaramSeverity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor',
  WARNING = 'warning',
  INDETERMINATE = 'indeterminate',
  INFORMATIONAL = 'info',
  CLEAR = 'clear'
}

export enum ApVenueStatusEnum {
  IN_SETUP_PHASE = '1_InSetupPhase',
  OFFLINE = '1_InSetupPhase_Offline',
  OPERATIONAL = '2_Operational',
  REQUIRES_ATTENTION = '3_RequiresAttention',
  TRANSIENT_ISSUE = '4_TransientIssue'
}

export type ChartData = {
  category: string
  series: Array<{ name: string, value: number }>
}

export interface NetworkDetailHeader {
  activeVenueCount: number,
  aps: {
    summary?: {
      [key in ApVenueStatusEnum]?: number
    },
    totalApCount: number
  },
  network: {
    name: string
    id: string
    clients: number
  }
}

export interface Dashboard {
  summary?: {
    clients?: {
      summary: {
        [prop: string]: number;
      },
      clientDto: Array<{
        [prop: string]: string
      }>,
      totalCount: number;
    },
    switchClients?: {
      summary: {
        [prop: string]: string;
      },
      totalCount: number;
    },
    aps?: {
      summary: {
        [key in ApVenueStatusEnum]?: number
      },
      totalCount: number;
    },
    switches?: {
      summary: {
        [key in SwitchStatusEnum]?: string
      },
      totalCount: number;
    },
    dps?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    },
    edges?: EdgeStatusSeverityStatistic,
    venues?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    }
    alarms?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number
    },
  };
  incidents?: {
    P1: number,
    P2: number,
    P3: number,
    P4: number
  };
  aps?: {
    apsStatus: Array<{
      [prop: string]: {
        apStatus: {
          [ key in ApVenueStatusEnum]?: number
        },
        totalCount: number
      }
    }>,
    totalCount: number
  };
  switches?: {
    switchesStatus: Array<{
      [prop: string]: {
        switchStatus: {
          [ key in SwitchStatusEnum]?: number
        },
        totalCount: number
      }
    }> | undefined,
    totalCount: number
  };
  edges?: {
    edgesStatus: Array<{
      [prop: string]: {
        edgeStatus: {
          [ key in EdgeStatusSeverityEnum]?: number
        },
        totalCount: number
      }
    }>,
    totalCount: number
  };
  venues?: Array<{
    [prop: string]: {
      zipCode?: string,
      country?: string,
      city?: string,
      latitude?: number,
      crtTime?: string,
      description?: string,
      type?: string,
      lastUpdTime?: string,
      tags?: string,
      name?: string,
      tenantId?: string,
      street1?: string,
      street2?: string,
      state?: string,
      id?: string,
      longitude?: number,
      timeZone?: string,
      venueStatus?: ApVenueStatusEnum
    }
  }>;
}

interface RadiusService {
  ip: string
  port: number
  sharedSecret: string
}

export interface Service {
  id: string
  name: string
  type: ServiceType
  status: ServiceStatus
  adminState: ServiceAdminState
  scope: number
  health: string
  tags: string[]
}

export interface RadiusValidate {
  data: {
    errors: RadiusValidateErrors[],
    requestId: string
  },
  status: number
}
export interface RadiusValidateErrors {
  code: string,
  message: string,
  object: string,
  value: {
    id: string,
    primary?: RadiusService,
    secondary?: RadiusService,
    tlsEnabled?: boolean,
    cnSanIdentity?: string,
    ocspUrl?: string,
    trustedCAChain?: TrustedCAChain
  }
}
export interface DnsProxyRule {
  domainName?: string,
  key?: string,
  ipList?: string[] | undefined
}

export interface DnsProxyContextType {
  dnsProxyList: DnsProxyRule[] | [],
  setDnsProxyList: (dnsProxyList: DnsProxyRule[]) => void
  setEnableDnsProxy: (enable: boolean)=> void
}

export interface WifiCallingSetting extends EnforceableFields {
  id: string,
  serviceName: string,
  description?: string | undefined,
  qosPriority: QosPriorityEnum,
  tenantId?: string,
  name?: string,
  epdgs?: EPDG[],
  networkIds?: string[],
  wifiNetworkIds?: string[]
}

export interface WifiCallingSettingContextType {
  wifiCallingSettingList: WifiCallingSetting[],
  setWifiCallingSettingList: (wifiCallingSettingList: WifiCallingSetting[]) => void
}

export enum ClientStatusEnum {
  HISTORICAL = 'historical',
  CONNECTED = 'connected'
}

export interface Capabilities {
  apModels: CapabilitiesApModel[]
  version: string
}

export interface ClientStatistic {
  applications: number;
  apsConnected: number;
  avgRateBPS: string;
  avgSessionLengthSeconds: unknown | number;
  sessions: number;
  userTrafficBytes: number;
  userTraffic5GBytes: number;
  userTraffic6GBytes: number;
  userTraffic24GBytes: number;
}

export const GridInactiveRowDataFlag = 'inactiveRow'
export interface GridDataRow {
  inactiveTooltip?: string;
  [GridInactiveRowDataFlag]?: boolean;
}

export interface PaginationQueryResult<T> {
  page: number
  pageSize: number
  totalCount: number
  content: T[]
}

export interface PlmMessageBanner {
  createdBy: string,
  createdDate: string,
  description: string,
  endTime: string,
  id: string,
  startTime: string,
  tenantType: string,
  updatedDate: string
}

export enum SWITCH_CLIENT_TYPE {
  AP = 'WLAN_AP',
  ROUTER = 'ROUTER'
}

export interface SwitchClient {
  id: string
  clientMac: string
  clientIpv4Addr: string
  clientIpv6Addr: string
  clientName: string
  clientDesc: string
  clientType: SWITCH_CLIENT_TYPE
  switchFirmware?: string
  switchId: string
  switchName: string
  switchPort: string
  switchPortId?: string
  switchSerialNumber: string
  clientVlan: string
  clientAuthType?: string
  vlanName: string
  venueId: string
  venueName: string
  isRuckusAP: boolean
  vni?: string
  dhcpClientOsVendorName?: string
  dhcpClientDeviceTypeName?: string
  dhcpClientModelName?: string
  dhcpClientHostName?: string
  switchPortStatus?: SwitchPortViewModel
}

export interface QosMapRule {
  enabled: boolean
  priority: number
  dscpLow: number
  dscpHigh: number
  dscpExceptionValues: number[]
}

export const RWGStatusMap = {
  [RWGStatusEnum.ONLINE]: defineMessage({ defaultMessage: 'Operational' }),
  [RWGStatusEnum.OFFLINE]: defineMessage({ defaultMessage: 'Offline' }),
  [RWGStatusEnum.STAGING]: defineMessage({ defaultMessage: 'Staging' }),
  [RWGStatusEnum.DATA_INCOMPLETE]: defineMessage({ defaultMessage: 'Data Incomplete' }),
  [RWGStatusEnum.INSUFFICIENT_LICENSE]: defineMessage({ defaultMessage: 'Insufficient License' }),
  [RWGStatusEnum.INVALID_APIKEY]: defineMessage({ defaultMessage: 'Invalid API Key' }),
  [RWGStatusEnum.INVALID_CERTIFICATE]: defineMessage({ defaultMessage: 'Invalid Certificate' }),
  [RWGStatusEnum.INVALID_HOSTNAME]: defineMessage({ defaultMessage: 'Invalid Hostname' }),
  [RWGStatusEnum.RWG_STATUS_UNKNOWN]: defineMessage({ defaultMessage: 'RWG Status Unknown' }),
  [RWGStatusEnum.INVALID_LICENSE]: defineMessage({ defaultMessage: 'Invalid License' })
}

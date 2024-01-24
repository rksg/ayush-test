import type { TimeStamp } from '@acx-ui/types'

import { FirmwareCategory, SkippedVersion }                                                                                                        from '..'
import { EdgeIpModeEnum, EdgeLagLacpModeEnum, EdgeLagTimeoutEnum, EdgeLagTypeEnum, EdgePortTypeEnum, EdgeServiceTypeEnum, EdgeStatusSeverityEnum } from '../models/EdgeEnum'

export const PRODUCT_CODE_VIRTUAL_EDGE = '96'

export interface EdgeGeneralSetting {
  description: string
  edgeGroupId: string
  name: string
  serialNumber?: string
  venueId?: string
  tags: string // TODO when tags component is ready need to change type to array
}

export interface EdgeResourceUtilization {
  cpuCores?: number,
  cpuUsedPercentage?: number,
  memoryUsedKb?: number,
  memoryTotalKb?: number,
  diskUsedKb?: number,
  diskTotalKb?: number,
  memoryUsed?: number,   // Bytes
  memoryTotal?: number,  // Bytes
  diskUsed?: number,     // Bytes
  diskTotal?: number     // Bytes
}
export interface Edge extends EdgeResourceUtilization {
  name: string
  deviceStatus: string
  type: string
  model: string
  serialNumber: string
  ip: string
  ports: string
  venueName: string
  venueId: string
  tags: string[]
  description?: string
  firmwareVersion?: string
}
export interface EdgeStatus extends EdgeResourceUtilization {
  serialNumber: string
  venueId: string
  venueName: string
  name: string
  description?: string
  model: string
  type: string
  tags: string[]
  deviceStatus: string
  deviceStatusSeverity: string
  ip: string
  ports: string
  firmwareVersion?: string
  firewallId?: string
  firewallName?: string
  upTime?: number
  clusterInterface?: string
}
export interface EdgeDetails {
  serialNumber: string
  venueId: string
  name: string
  description: string
  softDeleted: boolean
  model: string
  updatedDate: string
}

export interface EdgePort {
  id: string
  portType: EdgePortTypeEnum.WAN | EdgePortTypeEnum.LAN | EdgePortTypeEnum.UNCONFIGURED
  name: string
  mac: string
  enabled: boolean
  ipMode: EdgeIpModeEnum.DHCP | EdgeIpModeEnum.STATIC
  ip: string
  subnet: string
  gateway: string
  natEnabled: boolean
  corePortEnabled: boolean
  interfaceName?: string
}

export interface EdgePortWithStatus extends EdgePort {
  statusIp: string
  isLagPort?: boolean
}

export interface EdgePortConfig {
  ports: EdgePort[]
}

export interface EdgeSubInterface extends EdgePort {
  vlan: number
}
export interface EdgeDnsServers {
  primary: string
  secondary: string
}

export interface EdgeStaticRoute {
  id: string
  destIp: string
  destSubnet: string
  nextHop: string
}

export interface EdgeStaticRouteConfig {
  routes: EdgeStaticRoute[]
}

export interface EdgePortStatus {
  type: EdgePortTypeEnum.UNCONFIGURED | EdgePortTypeEnum.WAN | EdgePortTypeEnum.LAN
  portId: string
  name: string
  status: string
  adminStatus: string
  mac: string
  speedKbps: number
  duplex: string
  ip: string,
  ipMode: string
  sortIdx: number
  vlan: string
  subnet: string
  interfaceName?: string
}

export interface EdgeStatusSeverityStatistic {
  summary: {
    [key in EdgeStatusSeverityEnum]?: number
  },
  totalCount: number
}

export interface LatestEdgeFirmwareVersion extends EdgeFirmwareVersion {
  createdDate: string
}

export interface EdgeVenueFirmware {
  id: string
  name: string
  updatedDate: string
  versions: EdgeFirmwareVersion[]
  availableVersions: EdgeFirmwareVersion[]
  nextSchedule: EdgeSchedule
  lastSkippedVersions?: SkippedVersion[]
}

export interface EdgeSchedule {
  timeSlot: {
    startDateTime: string
    endDateTime: string
  }
  version: {
    id: string
    name: string
    category: FirmwareCategory
  }
}

export interface EdgeFirmwareVersion {
  name: string
  category: FirmwareCategory
  id?: string
  onboardDate: string
}

export interface EdgeFirmwareUpdateData {
  venueIds: string[]
  firmwareVersion: string
}

export type EdgeStatusTimeSeries = {
  time: string[];
  isEdgeUp: number[];
}

export interface EdgeTotalUpDownTime {
  timeSeries: EdgeStatusTimeSeries
  totalDowntime: number   // seconds
  totalUptime: number     // seconds
}

export interface EdgeTopTraffic {
  traffic: number[]       // bytes
  portTraffic: {
    portName: string,
    traffic: number       // bytes
  }[]
}

export type EdgeResourceTimeSeries = {
  cpu: number[]        // percentage
  memory: number[]     // percentage
  disk: number[]       // percentage
  time: string[]
  memoryUsedBytes: number[] // bytes
  diskUsedBytes: number[]   // bytes
}

export type EdgeResourceUtilizationData = {
  timeSeries: EdgeResourceTimeSeries
}

export interface EdgePortTrafficTimeSeries {
  portName: string,
  tx: number[],
  rx: number[],
  total: number[]
}
export interface EdgeAllPortTrafficData {
  timeSeries: {
    ports: EdgePortTrafficTimeSeries[]
    time: TimeStamp[],
  },
  portCount: number
}
export interface EdgeTimeSeriesPayload {
  start: string,
  end: string,
  granularity: string
  venueIds?: string[]
}

export interface EdgeService {
  edgeId: string
  serviceName: string
  serviceId: string
  serviceType: EdgeServiceTypeEnum
  status: string
  currentVersion: string
  targetVersion: string
  edgeAlarmSummary?: EdgeAlarmSummary[]
}

export interface PingEdge {
  targetHost: string
}

export interface TraceRouteEdge {
  targetHost: string
}

export interface EdgesTopTraffic {
  topTraffic: {
    name: string
    serial: string
    rxBytes: number
    txBytes: number
  }[]
}

export interface EdgesTopResources {
  cpu: {
    name: string
    serial: string
    percentage: number
  }[],
  memory: {
    name: string
    serial: string
    percentage: number
    usedBytes: number
  }[],
  disk: {
    name: string
    serial: string
    percentage: number
    usedBytes: number
  }[]
}

export interface EdgePasswordDetail {
  loginPassword: string
  enablePassword: string
}

export interface EdgeAlarmSummary {
  edgeId: string
  severitySummary: {
    major?: number
    critical?: number
  }
  totalCount: number
}

export enum EdgeTroubleshootingType {
  PING = 'PING',
  TRACE_ROUTE = 'TRACE_ROUTE'
}

export interface EdgeLagMemberStatus {
  portId: string
  name: string
  state?: string
  rxCount?: number
  txCount?: number
  systemId?: string
  key?: string
  peerSystemId?: string
  peerKey?: string
}

export interface EdgeLagStatus {
  lagId: number
  tenantId: string
  serialNumber: string
  name: string
  description: string
  status?: string
  adminStatus?: string
  portType: EdgePortTypeEnum
  lagType: EdgeLagTypeEnum
  lacpTimeout: EdgeLagTimeoutEnum
  lagMembers: EdgeLagMemberStatus[]
  ipMode: EdgeIpModeEnum
  mac?: string
  vlan: string
  ip?: string
  subnet?: string
  isCorePort: string
}

export interface EdgeLag {
    id: number,
    description: string
    lagType: EdgeLagTypeEnum
    lacpMode: EdgeLagLacpModeEnum
    lacpTimeout: EdgeLagTimeoutEnum
    lagMembers: {
        portId: string
        portEnabled: boolean
    }[]
    portType: EdgePortTypeEnum
    ipMode: EdgeIpModeEnum
    ip?: string
    subnet?: string
    gateway?: string
    corePortEnabled: boolean
    natEnabled: boolean
    lagEnabled: boolean
}

export interface EdgeClusterStatus {
  tenantId?: string
  clusterId?: string
  name?: string
  virtualIp?: string
  venueId?: string
  venueName?: string
  clusterStatus?: string
  haStatus?: string
  edgeList?: EdgeStatus[]
}

export interface EdgeClusterTableDataType extends EdgeStatus,
Omit<EdgeClusterStatus, 'tenantId' | 'name' | 'venueId' | 'venueName'> {
  isFirstLevel?: boolean
  children?: EdgeStatus[]
}

import type { TimeStamp } from '@acx-ui/types'

import {
  ApCompatibility, Compatibility,
  FirmwareCategory,
  IncompatibleFeatureTypeEnum,
  SkippedVersion
} from '..'
import {
  ClusterHaFallbackScheduleTypeEnum,
  ClusterHaLoadDistributionEnum,
  ClusterHighAvailabilityModeEnum,
  ClusterNodeStatusEnum,
  CompatibilityEntityTypeEnum,
  EdgeIpModeEnum, EdgeLagLacpModeEnum, EdgeLagTimeoutEnum, EdgeLagTypeEnum,
  EdgeLinkDownCriteriaEnum, EdgeMultiWanModeEnum, EdgeMultiWanProtocolEnum,
  EdgePortTypeEnum,
  EdgeServiceTypeEnum, EdgeStatusSeverityEnum,
  NodeClusterRoleEnum,
  EdgeClusterProfileTypeEnum
} from '../models/EdgeEnum'

export type EdgeSerialNumber = string
export const PRODUCT_CODE_VIRTUAL_EDGE = '96'

export interface EdgeGeneralSetting {
  description: string
  edgeGroupId: string
  name: string
  serialNumber?: string
  venueId?: string
  clusterId?: string
  highAvailabilityMode?: ClusterHighAvailabilityModeEnum
  tags: string[] // TODO when tags component is ready need to change type to array
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
  haStatus?: NodeClusterRoleEnum
  clusterNodeStatus?: ClusterNodeStatusEnum
  clusterId?: string
  hasCorePort?: boolean
  incompatible?: number // UI only
  isHqosEnabled?: boolean
  isArpTerminationEnabled?: boolean
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
  portType: EdgePortTypeEnum
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
  maxSpeedCapa: number
}

export interface EdgePortWithStatus extends EdgePort {
  statusIp?: string
  isLagPort?: boolean
}

export interface EdgePortConfig {
  ports: EdgePort[] | EdgePortWithStatus[]
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

interface EdgeMultiWanStats {
  wanPortStatus?: string
  wanLinkStatus?: string    // overall link health status
  wanLinkTargets?: { ip: string, status: string }[] // per link target health status
}

export interface EdgeMultiWanConfigStats extends EdgeMultiWanStats{
  serialNumber:string
  edgeClusterId: string
  multiWanPolicyId: string
  portName:string
  priority: number
  linkHealthMonitorEnabled: boolean
  monitorProtocol: EdgeMultiWanProtocolEnum
  monitorTargets: string[]
  monitorLinkDownCriteria: EdgeLinkDownCriteriaEnum
  monitorIntervalSec: number
  monitorMaxCountToDown: number
  monitorMaxCountToUp:number
}

export interface EdgePortStatus {
  type: EdgePortTypeEnum
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
  serialNumber?: EdgeSerialNumber
  isCorePort?: string
  multiWan?: EdgeMultiWanConfigStats
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

export interface EdgeClusterService {
  edgeClusterId: string
  serviceId: string
  serviceName: string
  serviceType: EdgeServiceTypeEnum | EdgeClusterProfileTypeEnum
  currentVersion: string
  targetVersion: string
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
  multiWan?: EdgeMultiWanConfigStats
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

export interface EdgeCluster {
  id: string
  name: string
  description?: string
  smartEdges: {
    serialNumber: string
    name: string
  }[]
  virtualIpSettings: {
      virtualIps: VirtualIpSetting[]
  }
}

export interface EdgeFeatureRequirement {
  featureName: string
  requiredFw: string
}
export interface EdgeFeatureSets {
  featureSets: EdgeFeatureRequirement[]
}

export interface EdgeIncompatibleFeature {
  featureRequirement: EdgeFeatureRequirement,
  incompatibleDevices: EdgeIncompatibleDevice[]
}

export interface EntityCompatibility {
  identityType: CompatibilityEntityTypeEnum
  id: string
  incompatibleFeatures: EdgeIncompatibleFeature[],
  total: number
  incompatible: number
}
export interface VenueEdgeCompatibilitiesResponse {
  compatibilities?: EntityCompatibility[]
}

export interface EdgeServiceCompatibility {
  serviceId?: string
  clusterEdgeCompatibilities?: EntityCompatibility[]
}
export interface EdgeServiceCompatibilitiesResponse {
  compatibilities?: EdgeServiceCompatibility[]
}

export type VenueSdLanApCompatibility = Omit<ApCompatibility, 'id'> & {
  venueId: string
}
export interface EdgeSdLanApCompatibility {
  serviceId?: string
  venueSdLanApCompatibilities?: VenueSdLanApCompatibility[]
}
export interface EdgeSdLanApCompatibilitiesResponse {
  compatibilities?: EdgeSdLanApCompatibility[]
}

// Content-Type: application/vnd.ruckus.v1.1+json
interface EdgeFeatureRequirementV1_1 {
  firmware: string
}
export interface EdgeFeatureSetsV1_1 {
  featureSets: EdgeFeatureDetailsV1_1[]
}
export interface EdgeFeatureDetailsV1_1 {
    featureName: string
    featureGroup?: string
    featureType?: IncompatibleFeatureTypeEnum,
    featureLevel?: string
    requirements?: EdgeFeatureRequirementV1_1[]
}
export interface EdgeIncompatibleDevice {
  firmware: string,
  count: number
}
export interface EdgeIncompatibleFeatureV1_1 extends EdgeFeatureDetailsV1_1{
  incompatibleDevices?: EdgeIncompatibleDevice[]  // undefined when fullyCompatible
  children?: EdgeIncompatibleFeatureV1_1[]
}
export interface EntityCompatibilityV1_1 {
  identityType: CompatibilityEntityTypeEnum
  id: string
  incompatibleFeatures: EdgeIncompatibleFeatureV1_1[],
  total: number
  incompatible: number
}
export interface VenueEdgeCompatibilitiesResponseV1_1 {
  compatibilities?: EntityCompatibilityV1_1[]
}
export interface EdgeServiceCompatibilityV1_1 {
  serviceId?: string
  clusterEdgeCompatibilities?: EntityCompatibilityV1_1[]
}
export interface EdgeServiceCompatibilitiesResponseV1_1 {
  compatibilities?: EdgeServiceCompatibilityV1_1[]
}

// ap incompatibility by model
export type VenueEdgeServiceApCompatibility = Omit<Compatibility, 'id'> & {
  venueId: string
}
export interface EdgeServiceApCompatibility {
  serviceId?: string
  venueEdgeServiceApCompatibilities?: VenueEdgeServiceApCompatibility[]
}
export interface EdgeServicesApCompatibilitiesResponse {
  compatibilities?: EdgeServiceApCompatibility[]
}
// ap incompatibility by model

export interface VirtualIpSetting {
  virtualIp: string
  ports: {
    serialNumber: string
    portName: string
  }[]
  timeoutSeconds: number
}

export interface EdgeClusterStatus {
  tenantId?: string
  clusterId?: string
  name?: string
  virtualIp?: string
  venueId?: string
  venueName?: string
  clusterStatus?: string
  edgeList?: EdgeStatus[]
  description?: string
  hasCorePort?: boolean,
  highAvailabilityMode?: ClusterHighAvailabilityModeEnum
  firmwareVersion?: string
  activeAps?:number
}

export interface EdgeClusterTableDataType extends EdgeStatus,
Omit<EdgeClusterStatus, 'tenantId' | 'name' | 'venueId' | 'venueName'> {
  isFirstLevel?: boolean
  children?: EdgeStatus[]
}

export interface EdgePortInfo {
  serialNumber: EdgeSerialNumber
  id: string
  portName: string
  ipMode: EdgeIpModeEnum,
  ip: string
  mac: string
  subnet: string
  portType: EdgePortTypeEnum
  isCorePort: boolean
  isLag: boolean
  isLagMember: boolean
  portEnabled: boolean
  status?: string // Up, Down
  vlan?: string
}

export type EdgeNodesPortsInfo = Record<EdgeSerialNumber, EdgePortInfo[]>

export interface ClusterNetworkSettings {
  virtualIpSettings?: VirtualIpSetting[]
  portSettings: {
    serialNumber: EdgeSerialNumber,
    ports: EdgePort[]
  }[]
  lagSettings: {
    serialNumber: EdgeSerialNumber,
    lags: EdgeLag[]
  }[]
  highAvailabilitySettings?: {
    fallbackSettings: {
      enable: boolean
      schedule: {
        type: ClusterHaFallbackScheduleTypeEnum
        time?: string
        weekday?: string
        intervalHours?: number
      }
    }
    loadDistribution: ClusterHaLoadDistributionEnum
  },
  multiWanSettings?: ClusterNetworkMultiWanSettings
}

// ========== Multi WAN ===========

export interface EdgeWanLinkHealthCheckPolicy {
  protocol: EdgeMultiWanProtocolEnum
  targetIpAddresses: string[]
  linkDownCriteria: EdgeLinkDownCriteriaEnum
  intervalSeconds: number
  maxCountToDown: number
  maxCountToUp: number
}

export interface EdgeWanMember {
  serialNumber: string
  portName: string
  priority: number
  healthCheckEnabled: boolean
  linkHealthCheckPolicy?: EdgeWanLinkHealthCheckPolicy
}

export interface ClusterNetworkMultiWanSettings {
  mode: EdgeMultiWanModeEnum
  wanMembers: EdgeWanMember[]
}

// ========== Multi WAN ===========

export interface ClusterSubInterfaceSettings {
  nodes: NodeSubInterfaces[]
}

export interface NodeSubInterfaces {
  serialNumber: EdgeSerialNumber
  ports: PortSubInterface[]
  lags: LagSubInterface[]
}

export interface PortSubInterface {
  portId: string
  subInterfaces: SubInterface[]
}

export interface LagSubInterface {
  lagId: number
  subInterfaces: SubInterface[]
}

export interface SubInterface {
  id?: string
  vlan: number
  portType: EdgePortTypeEnum
  ipMode: EdgeIpModeEnum
  ip?: string
  subnet?: string
  interfaceName?: string
}

export interface ClusterArpTerminationSettings {
  enabled: boolean
  agingTimeSec: number
}

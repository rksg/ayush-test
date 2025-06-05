import { EdgeAlarmSummary }             from '../..'
import { LeaseTimeType, LeaseTimeUnit } from '../../models'

export interface EdgeDhcpSetting {
    id: string;
    serviceName: string;
    dhcpRelay?:boolean;
    externalDhcpServerFqdnIp: string;
    domainName: string;
    primaryDnsIp:string;
    secondaryDnsIp:string;
    leaseTime?: number;
    leaseTimeUnit?: LeaseTimeUnit;
    dhcpPools?: EdgeDhcpPool[];
    hosts?: EdgeDhcpHost[];
    dhcpOptions?: EdgeDhcpOption[];
}

export interface EdgeDhcpPool {
    id: string;
    poolName: string;
    subnetMask: string;
    poolStartIp: string;
    poolEndIp: string;
    gatewayIp:string;
    activated?: boolean;
}

export interface EdgeDhcpHost {
    id: string;
    hostName: string;
    mac: string;
    fixedAddress: string;
}

export interface EdgeDhcpOption {
  id: string;
  optionId: string;
  optionName: string;
  optionValue: string;
}

export interface DhcpPoolStats {
  tenantId: string
  id:string
  edgeId: string
  dhcpId: string
  poolName: string
  subnetMask: string
  poolRange: string
  gateway: string
  activated: string
  utilization?: number
}

export interface DhcpStats {
  tenantId: string
  id: string
  serviceName?: string
  serviceType: string
  dhcpRelay?: string
  dhcpPoolNum?: number
  edgeNum?: number
  venueNum?: number
  leaseTime?: string
  health?: string
  targetVersion?: string
  currentVersion?: string
  tags?: string[]
  edgeAlarmSummary?: EdgeAlarmSummary[]
  edgeClusterIds?: string[],
  clusterAppVersionInfo?: EdgeClusterAppVersionInfo[]
}

export interface EdgeClusterAppVersionInfo {
  edgeClusterId: string
  currentVersion?: string
  targetVersion?: string
}

export interface DhcpHostStats {
  hostName: string
  dhcpPoolName: string
  hostIpAddr: string
  hostMac: string
  hostStatus: string
  hostExpireDate: Date
  hostRemainingTime: number
  edgeId: string
  venueId: string
  dhcpId: string
}

export interface DhcpUeSummaryStats {
  edgeClusterId?: string
  venueId?: string
  successfulAllocation?: number
  remainsIps?: number
  droppedPackets?: number
}

export interface EdgeDhcpSettingFormData extends EdgeDhcpSetting {
  enableSecondaryDNSServer?: boolean
  leaseTimeType?: LeaseTimeType
  usedForPin?: boolean
}
import { EdgeAlarmSummary } from '../..'
import { LeaseTimeUnit }    from '../../models'

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
    dhcpPools: EdgeDhcpPool[];
    hosts?: EdgeDhcpHost[];
    dhcpOptions?: EdgeDhcpOption[];
    edgeIds: string[];
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
  edgeIds: string[]
  dhcpId: string
  poolName: string
  subnetMask: string
  poolRange: string
  gateway: string
  activated: string
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
}

export interface DhcpHostStats {
  dhcpPoolName: string
  hostIpAddr: string
  hostMac: string
  hostStatus: string
  hostExpireDate: Date
  hostRemainingTime: number
  edgeId: string
}

export interface DhcpUeSummaryStats {
  edgeName?: string
  edgeId?: string
  venueId?: string
  venueName?: string
  successfulAllocation?: number
  remainsIps?: number
  droppedPackets?: number
  edgeAlarmSummary?: EdgeAlarmSummary[]
}
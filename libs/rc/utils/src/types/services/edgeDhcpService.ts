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
    hosts: EdgeDhcpHost[];
    edgeIds: string[];
}

export enum LeaseTimeUnit {
    DAYS = 'DAYS',
    HOURS = 'HOURS',
    MINUTES = 'MINUTES'
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

export interface EdgeDhcpLease {
  name: string
  ip: string
  dhcpPool: string
  mac: string
  status: string
  expires: string
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
  updateAvailable?: boolean
  serviceVersion?: string
  tags?: string[]
  edgeName?: string
  edgeId?: string
  venueName?: string
  venueId?: string
  successfulAllocations?: number
  remainingIps?: number
  droppedPackets?: number
}
import {
  DHCPConfigTypeEnum
} from '../constants'

export enum AccessEnum {
  ALLOW = 'Allow',
  BLOCK = 'Block'
}

export interface L2AclPolicy {
  access?: AccessEnum,
  description?: string,
  macAddress?: string[],
  name: string,
  id: string
}

export interface L3AclPolicy {
  networksCount?: number,
  rulesCount?: number,
  name: string,
  id: string
}

export interface DevicePolicy {
  defaultAcces?: AccessEnum,
  description?: string,
  id: string,
  name: string,
  networksCount: number,
  rulesCount: number
}

export interface ApplicationPolicy {
  networksCount?: number,
  rulesCount?: number,
  name: string,
  id: string
}


export interface AccessControlProfile {
  name: string,
  id: string,
  rateLimiting?: {
    [key: string]: boolean | number,
    downlinkLimit: number,
    enabled: boolean,
    uplinkLimit: number
  },
  devicePolicy?: {
    enabled: boolean
    id: string
  },
  applicationPolicy?: {
    enabled: boolean,
    id: string
  },
  l2AclPolicy?: {
    enabled: boolean,
    id: string
  },
  l3AclPolicy?: {
    enabled: boolean,
    id: string
  }
}

export interface VlanPool {
  name: string,
  id: string,
  tenantId: string,
  vlanMembers: string[]
}


export interface CloudpathServer {
  id: string
  name: string
  deploymentType: 'Cloud' | 'OnPremise'
  deployedInVenueId?: string
  deployedInVenueName?: string
  authRadius: {
    id: string
    primary: RadiusService
  }
  accountingRadiu?: {
    id: string
    primary: RadiusService
  }
}



export interface RadiusService {
  ip: string
  port: number
  sharedSecret: string
}



export interface DHCPPool {
  id: string;
  name: string;
  description?: string;
  allowWired: boolean;
  ip: string;
  mask: string;
  excludedRangeStart?: string;
  excludedRangeEnd?: string;
  primaryDnsIp: string;
  secondaryDnsIp: string;
  leaseTime: number;
  leaseTimeHours: string;
  leaseTimeMinutes: string;
  leaseUnit: string;
  vlan: number;
  dhcpOptions: DHCPOption[];
  activated?: boolean;
}

export interface DHCPOption{
  optId: string;
  id: number;
  optName: string;
  format: string;
  value: string;
}

export interface CreateDHCPFormFields {
  serviceName: string;
  // tags: string[];
  // createType: ServiceTechnology;
  dhcpMode: DHCPConfigTypeEnum;
  dhcpPools: DHCPPool[];
  venueIds: string[];
}

export interface DHCPSaveData extends CreateDHCPFormFields {
  id?: string;
}

export interface DHCPVenue {
  id?: string
  name?: string
  scheduler: {
    type: string
  }
  venueId: string
  dhcpId: string
}

export interface VenueDHCPProfile {
  serviceProfileId: string,
  enabled: boolean,
  dhcpServiceAps: DHCPProfileAps[]
}

export interface DHCPProfileAps {
  serialNumber: string,
  role: string
}

export interface DHCPLeases {
  hostName: string,
  ipAddress: string,
  dhcpPoolId: string,
  dhcpPoolName: string,
  macAddress: string,
  status: string,
  leaseExpiration: string
}


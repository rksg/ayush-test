
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



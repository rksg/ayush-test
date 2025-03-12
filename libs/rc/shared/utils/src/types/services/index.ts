export * from './dhcpService'
export * from './edgeDhcpService'
export * from './edgeFirewallService'
export * from './dpskService'
export * from './wifiCallingService'
export * from './edgePinService'
export * from './mdnsProxyService'
export * from './portalService'
export * from './edgeSdLanService'
export * from './edgeMdnsProxyService'
export * from './edgeTnmService'

export enum AccessEnum {
  ALLOW = 'Allow',
  BLOCK = 'Block'
}

export interface L2AclPolicy {
  access?: AccessEnum,
  description?: string,
  macAddress?: string[],
  wifiNetworkIds?: string[],
  networkIds?: string[],
  networksCount?: number,
  rulesCount?: number,
  name: string,
  id: string
}

export interface L3AclPolicy {
  networksCount?: number,
  rulesCount?: number,
  description?: string,
  rules?: number,
  wifiNetworkIds?: string[],
  networkIds?: string[],
  name: string,
  id: string
}

export interface DevicePolicy {
  defaultAcces?: AccessEnum,
  description?: string,
  rules?: number,
  wifiNetworkIds?: string[],
  networkIds?: string[],
  id: string,
  name: string,
  networksCount: number,
  rulesCount: number
}

export interface ApplicationPolicy {
  networksCount?: number,
  rulesCount?: number,
  description?: string,
  rules?: number,
  wifiNetworkIds?: string[],
  networkIds?: string[],
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
  },
  policyName?: string,
  description?: string
}

export interface AccessControlProfileTemplate {
  name: string,
  id: string,
  l2AclPolicyId?: string,
  l2AclPolicyName?: string,
  l3AclPolicyId?: string,
  l3AclPolicyName?: string,
  devicePolicyId?: string,
  devicePolicyName?: string,
  applicationPolicyId?: string,
  applicationPolicyName?: string,
  clientRateUpLinkLimit?: number,
  clientRateDownLinkLimit?: number
}

export interface AccessControlFormFields {
  description: string | undefined
  enableApplications: boolean | undefined
  enableClientRateLimit: boolean | undefined
  enableDeviceOs: boolean | undefined
  enableLayer2: boolean | undefined
  enableLayer3: boolean | undefined
  l2AclPolicyId: string | undefined
  l3AclPolicyId: string | undefined
  devicePolicyId: string | undefined
  applicationPolicyId: string | undefined
  rateLimiting?: {
    enableDownloadLimit?: boolean
    enableUploadLimit?: boolean
    uplinkLimit?: number
    downlinkLimit?: number
  }
  policyName: string
}

export interface RadiusService {
  ip: string
  port: number
  sharedSecret: string
}

export enum VlanType {
  VLAN = 'vlanId',
  Pool = 'vlanPool'
}

export interface l2AclPolicyInfoType {
  id: string,
  macAddresses: string[],
  name: string,
  access: string
}

export interface l3AclPolicyInfoType {
  id: string,
  l3Rules: L3Rule[],
  name: string,
  defaultAccess: string
}

export interface AccessControlInfoType {
  id: string,
  name: string,
  description?: string,
  devicePolicy?: {
    id: string,
    enabled: boolean
  },
  l2AclPolicy?: {
    id: string,
    enabled: boolean
  },
  l3AclPolicy?: {
    id: string,
    enabled: boolean
  },
  applicationPolicy?: {
    id: string,
    enabled: boolean
  },
  rateLimiting?: {
    uplinkLimit: number,
    downlinkLimit: number,
    enabled: boolean
  },
  networkIds?: string[]
}

export interface appPolicyInfoType {
  id: string,
  rules: AppRule[],
  name: string,
  tenantId: string
}

export interface devicePolicyInfoType {
  id: string,
  rules: DeviceRule[],
  name: string,
  defaultAccess: string,
  tenantId: string
}

export interface DeviceRule {
  action: AccessStatus,
  deviceType: string,
  name: string,
  osVendor: string,
  vlan?: number
  uploadRateLimit?: number,
  downloadRateLimit?: number
}

export interface L3Rule {
  id: string
  access: 'ALLOW' | 'BLOCK',
  description: string,
  destination: {
    enableIpSubnet: boolean,
    port: string
  },
  priority: number,
  source: {
    enableIpSubnet: boolean
  },
  protocol?: string
}

export interface AppRule {
  protocol?: string
  netmask?: string
  destinationIp?: string
  destinationPort?: number
  portMapping?: ApplicationPortMappingType
  accessControl: string,
  applicationId: number,
  applicationName: string,
  category: string,
  categoryId: number,
  id: string,
  name: string,
  priority: number,
  ruleType: string
}

export interface AvcCategory {
  catId: number,
  catName: string,
  appNames: string[]
}

export interface AvcApp {
  appName: string,
  avcAppAndCatId: {
    catId: number,
    appId: number
  }
}

export enum Layer3ProtocolType {
  ANYPROTOCOL = 'ANYPROTOCOL',
  L3ProtocolEnum_TCP = 'L3ProtocolEnum_TCP',
  L3ProtocolEnum_UDP = 'L3ProtocolEnum_UDP',
  L3ProtocolEnum_UDPLITE = 'L3ProtocolEnum_UDPLITE',
  L3ProtocolEnum_ICMP_ICMPV4 = 'L3ProtocolEnum_ICMP_ICMPV4',
  L3ProtocolEnum_IGMP = 'L3ProtocolEnum_IGMP',
  L3ProtocolEnum_ESP = 'L3ProtocolEnum_ESP',
  L3ProtocolEnum_AH = 'L3ProtocolEnum_AH',
  L3ProtocolEnum_SCTP = 'L3ProtocolEnum_SCTP'
}

export enum AccessStatus {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK'
}

export enum ApplicationAclType {
  DENY = 'DENY',
  QOS = 'QOS',
  RATE_LIMIT = 'RATE_LIMIT'
}

export enum ApplicationRuleType {
  SIGNATURE = 'SIGNATURE',
  USER_DEFINED = 'USER_DEFINED'
}

export enum ApplicationPortMappingType {
  IP_WITH_PORT = 'IP_WITH_PORT',
  PORT_ONLY = 'PORT_ONLY'
}

export enum EnabledStatus {
  ON = 'ON',
  OFF = 'OFF'
}

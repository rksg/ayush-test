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
  }
}

export interface AvcCat {
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
  TCP = 'TCP',
  UDP = 'UDP',
  UDPLITE = 'UDPLITE',
  ICMP = 'ICMP',
  IGMP = 'IGMP',
  ESP = 'ESP',
  AH = 'AH',
  SCTP = 'SCTP'
}

export enum AccessStatus {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK'
}

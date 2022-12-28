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

export interface devicePolicyInfoType {
  id: string,
  rules: DeviceRule[],
  name: string,
  defaultAccess: string,
  tenantId: string
}

export interface DeviceRule {
  action: 'ALLOW' | 'BLOCK',
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

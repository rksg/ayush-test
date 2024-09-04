import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import { ServiceOperation } from './serviceRouteUtils'

export type SvcPcyAllowedScope = Array<'wifi' | 'edge' | 'switch'>
export type SvcPcyAllowedType = ServiceType | PolicyType
export type SvcPcyScopeMap<T extends SvcPcyAllowedType> = Partial<Record<T, SvcPcyAllowedScope>>

type SvcPcyAllowedOperChar = 'c' | 'r' | 'u' | 'd'
export type SvcPcyAllowedOper = ServiceOperation | PolicyOperation
export type SvcPcyOperMap<T extends SvcPcyAllowedOper> = Record<T, SvcPcyAllowedOperChar>

export const serviceTypeScopeMap: SvcPcyScopeMap<ServiceType> = {
  [ServiceType.PORTAL]: ['wifi'],
  [ServiceType.DHCP]: ['wifi'],
  [ServiceType.EDGE_DHCP]: ['edge'],
  [ServiceType.EDGE_FIREWALL]: ['edge'],
  [ServiceType.WIFI_CALLING]: ['wifi'],
  [ServiceType.MDNS_PROXY]: ['wifi'],
  [ServiceType.DPSK]: ['wifi'],
  [ServiceType.NETWORK_SEGMENTATION]: ['wifi', 'switch', 'edge'],
  [ServiceType.WEBAUTH_SWITCH]: ['switch'],
  [ServiceType.RESIDENT_PORTAL]: ['wifi'],
  [ServiceType.EDGE_SD_LAN]: ['wifi', 'edge'],
  [ServiceType.EDGE_SD_LAN_P2]: ['wifi', 'edge']
}

export const serviceOperScopeMap: SvcPcyOperMap<ServiceOperation> = {
  [ServiceOperation.CREATE]: 'c',
  [ServiceOperation.EDIT]: 'u',
  [ServiceOperation.DELETE]: 'd',
  [ServiceOperation.DETAIL]: 'r',
  [ServiceOperation.LIST]: 'r'
}

export const policyTypeScopeMap: SvcPcyScopeMap<PolicyType>= {
  [PolicyType.AAA]: ['wifi'],
  [PolicyType.CERTIFICATE]: ['wifi'],
  [PolicyType.CERTIFICATE_AUTHORITY]: ['wifi'],
  [PolicyType.CERTIFICATE_TEMPLATE]: ['wifi'],
  [PolicyType.SOFTGRE]: ['wifi'],
  [PolicyType.TUNNEL_PROFILE]: ['wifi', 'edge'],
  [PolicyType.ROGUE_AP_DETECTION]: ['wifi'],
  [PolicyType.SYSLOG]: ['wifi'],
  [PolicyType.CONNECTION_METERING]: ['wifi'],
  [PolicyType.ACCESS_CONTROL]: ['wifi'],
  [PolicyType.LAYER_2_POLICY]: ['wifi'],
  [PolicyType.LAYER_3_POLICY]: ['wifi'],
  [PolicyType.APPLICATION_POLICY]: ['wifi'],
  [PolicyType.DEVICE_POLICY]: ['wifi'],
  [PolicyType.VLAN_POOL]: ['wifi'],
  [PolicyType.CLIENT_ISOLATION]: ['wifi'],
  [PolicyType.WIFI_OPERATOR]: ['wifi']
}

export const policyOperScopeMap: SvcPcyOperMap<PolicyOperation> = {
  [PolicyOperation.CREATE]: 'c',
  [PolicyOperation.EDIT]: 'u',
  [PolicyOperation.DELETE]: 'd',
  [PolicyOperation.DETAIL]: 'r',
  [PolicyOperation.LIST]: 'r'
}

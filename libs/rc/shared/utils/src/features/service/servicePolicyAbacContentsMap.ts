import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import { ServiceOperation } from './serviceRouteUtils'

export const serviceTypeScopeMap: Record<ServiceType, Array<'wifi' | 'edge' | 'switch'>> = {
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

export const serviceOperScopeMap: Record<ServiceOperation, 'c' | 'r' | 'u' | 'd'> = {
  [ServiceOperation.CREATE]: 'c',
  [ServiceOperation.EDIT]: 'u',
  [ServiceOperation.DELETE]: 'd',
  [ServiceOperation.DETAIL]: 'r',
  [ServiceOperation.LIST]: 'r'
}

export const policyTypeScopeMap: Record<PolicyType, Array<'wifi' | 'edge' | 'switch'>> = {
  [PolicyType.AAA]: ['wifi'],
  [PolicyType.ACCESS_CONTROL]: ['wifi'],
  [PolicyType.LAYER_2_POLICY]: ['wifi'],
  [PolicyType.LAYER_3_POLICY]: ['wifi'],
  [PolicyType.APPLICATION_POLICY]: ['wifi'],
  [PolicyType.DEVICE_POLICY]: ['wifi'],
  [PolicyType.VLAN_POOL]: ['wifi'],
  [PolicyType.WIFI_OPERATOR]: ['wifi'],
  [PolicyType.ROGUE_AP_DETECTION]: ['wifi'],
  [PolicyType.SYSLOG]: ['wifi'],
  [PolicyType.CLIENT_ISOLATION]: ['wifi'],
  [PolicyType.SNMP_AGENT]: ['wifi'],
  [PolicyType.IDENTITY_PROVIDER]: ['wifi'],
  [PolicyType.MAC_REGISTRATION_LIST]: ['wifi'],
  [PolicyType.ADAPTIVE_POLICY]: ['wifi'],
  [PolicyType.ADAPTIVE_POLICY_SET]: ['wifi'],
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: ['wifi'],
  [PolicyType.TUNNEL_PROFILE]: ['wifi', 'edge'],
  [PolicyType.CONNECTION_METERING]: ['wifi', 'edge'],
  [PolicyType.LBS_SERVER_PROFILE]: ['wifi'],
  [PolicyType.CERTIFICATE_TEMPLATE]: ['wifi'],
  [PolicyType.CERTIFICATE_AUTHORITY]: ['wifi'],
  [PolicyType.CERTIFICATE]: ['wifi'],
  [PolicyType.QOS_BANDWIDTH]: ['edge']
}

export const policyOperScopeMap: Record<PolicyOperation, 'c' | 'r' | 'u' | 'd'> = {
  [PolicyOperation.CREATE]: 'c',
  [PolicyOperation.EDIT]: 'u',
  [PolicyOperation.DELETE]: 'd',
  [PolicyOperation.DETAIL]: 'r',
  [PolicyOperation.LIST]: 'r'
}

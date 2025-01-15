import { RbacOpsIds } from '@acx-ui/types'

import { genAllowOperationsPath }                                                                               from '../../allowOperationsUtils'
import { ServiceOperation, ServiceType }                                                                        from '../../constants'
import { PolicyOperation, PolicyType }                                                                          from '../../types'
import { EdgeDhcpUrls, EdgeHqosProfilesUrls, EdgeMdnsProxyUrls, EdgePinUrls, EdgeSdLanUrls, TunnelProfileUrls } from '../../urls'

import { SvcPcyAllowedOper, SvcPcyAllowedType } from './servicePolicyAbacContentsMap'

export type AllowedOperationMap<T extends SvcPcyAllowedType, O extends SvcPcyAllowedOper> =
  Partial<Record<T, Partial<Record<O, RbacOpsIds>>>>

export const serviceAllowedOperationMap = {
  [ServiceType.WIFI_CALLING]: {
    [ServiceOperation.CREATE]: ['POST:/wifiCallingServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/wifiCallingServiceProfiles/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/wifiCallingServiceProfiles/{id}'],
    [ServiceOperation.LIST]: ['POST:/wifiCallingServiceProfiles/query']
  },
  [ServiceType.DHCP]: {
    [ServiceOperation.CREATE]: ['POST:/dhcpConfigServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/dhcpConfigServiceProfiles/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/dhcpConfigServiceProfiles/{id}'],
    [ServiceOperation.LIST]: ['POST:/dhcpConfigServiceProfiles/query']
  },
  [ServiceType.MDNS_PROXY]: {
    [ServiceOperation.CREATE]: ['POST:/multicastDnsProxyProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/multicastDnsProxyProfiles/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/multicastDnsProxyProfiles/{id}'],
    [ServiceOperation.LIST]: ['POST:/multicastDnsProxyProfiles/query']
  },
  [ServiceType.DPSK]: {
    [ServiceOperation.CREATE]: ['POST:/dpskServices'],
    [ServiceOperation.EDIT]: ['PUT:/dpskServices/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/dpskServices/{id}'],
    [ServiceOperation.LIST]: ['GET:/dpskServices']
  },
  [ServiceType.PORTAL]: {
    [ServiceOperation.CREATE]: ['POST:/portalServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/portalServiceProfiles/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/portalServiceProfiles/{id}'],
    [ServiceOperation.LIST]: ['POST:/portalServiceProfiles/query']
  },
  [ServiceType.EDGE_SD_LAN]: {
    [ServiceOperation.CREATE]: [genAllowOperationsPath(EdgeSdLanUrls.addEdgeSdLan)],
    [ServiceOperation.EDIT]: [genAllowOperationsPath(EdgeSdLanUrls.updateEdgeSdLan)],
    [ServiceOperation.DELETE]: [genAllowOperationsPath(EdgeSdLanUrls.deleteEdgeSdLan)],
    [ServiceOperation.LIST]: [genAllowOperationsPath(EdgeSdLanUrls.getEdgeSdLanViewDataList)]
  },
  [ServiceType.EDGE_MDNS_PROXY]: {
    [ServiceOperation.CREATE]: [genAllowOperationsPath(EdgeMdnsProxyUrls.addEdgeMdnsProxy)],
    [ServiceOperation.EDIT]: [genAllowOperationsPath(EdgeMdnsProxyUrls.updateEdgeMdnsProxy)],
    [ServiceOperation.DELETE]: [genAllowOperationsPath(EdgeMdnsProxyUrls.deleteEdgeMdnsProxy)],
    // eslint-disable-next-line max-len
    [ServiceOperation.LIST]: [genAllowOperationsPath(EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList)]
  },
  [ServiceType.EDGE_DHCP]: {
    [ServiceOperation.CREATE]: [genAllowOperationsPath(EdgeDhcpUrls.addDhcpService)],
    [ServiceOperation.EDIT]: [genAllowOperationsPath(EdgeDhcpUrls.updateDhcpService)],
    [ServiceOperation.DELETE]: [genAllowOperationsPath(EdgeDhcpUrls.deleteDhcpService)],
    [ServiceOperation.LIST]: [genAllowOperationsPath(EdgeDhcpUrls.getDhcpStats)]
  },
  [ServiceType.PIN]: {
    [ServiceOperation.CREATE]: [genAllowOperationsPath(EdgePinUrls.createEdgePin)],
    [ServiceOperation.EDIT]: [genAllowOperationsPath(EdgePinUrls.updateEdgePin)],
    [ServiceOperation.DELETE]: [genAllowOperationsPath(EdgePinUrls.deleteEdgePin)],
    [ServiceOperation.LIST]: [genAllowOperationsPath(EdgePinUrls.getEdgePinStatsList)]
  }
}

export const policyAllowedOperationMap = {
  [PolicyType.AAA]: {
    [PolicyOperation.CREATE]: ['POST:/radiusServerProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/radiusServerProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/radiusServerProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/radiusServerProfiles/query']
  },
  [PolicyType.CLIENT_ISOLATION]: {
    [PolicyOperation.CREATE]: ['POST:/clientIsolationProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/clientIsolationProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/clientIsolationProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/clientIsolationProfiles/query']
  },
  [PolicyType.ROGUE_AP_DETECTION]: {
    [PolicyOperation.CREATE]: ['POST:/roguePolicies'],
    [PolicyOperation.EDIT]: ['PUT:/roguePolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/roguePolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/roguePolicies/query']
  },
  [PolicyType.SYSLOG]: {
    [PolicyOperation.CREATE]: ['POST:/syslogServerProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/syslogServerProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/syslogServerProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/syslogServerProfiles/query']
  },
  [PolicyType.VLAN_POOL]: {
    [PolicyOperation.CREATE]: ['POST:/vlanPoolProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/vlanPoolProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/vlanPoolProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/vlanPoolProfiles/query']
  },
  [PolicyType.ACCESS_CONTROL]: {
    [PolicyOperation.CREATE]: ['POST:/accessControlProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/accessControlProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/accessControlProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/accessControlProfiles/query']
  },
  [PolicyType.LAYER_2_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/l2AclPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/l2AclPolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/l2AclPolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/l2AclPolicies/query']
  },
  [PolicyType.LAYER_3_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/l3AclPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/l3AclPolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/l3AclPolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/l3AclPolicies/query']
  },
  [PolicyType.DEVICE_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/devicePolicies'],
    [PolicyOperation.EDIT]: ['PUT:/devicePolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/devicePolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/devicePolicies/query']
  },
  [PolicyType.APPLICATION_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/applicationPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/applicationPolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/applicationPolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/applicationPolicies/query']
  },
  [PolicyType.TUNNEL_PROFILE]: {
    [PolicyOperation.CREATE]: [genAllowOperationsPath(TunnelProfileUrls.createTunnelProfile)],
    [PolicyOperation.EDIT]: [genAllowOperationsPath(TunnelProfileUrls.updateTunnelProfile)],
    [PolicyOperation.DELETE]: [genAllowOperationsPath(TunnelProfileUrls.deleteTunnelProfile)],
    [PolicyOperation.LIST]: [genAllowOperationsPath(TunnelProfileUrls.getTunnelProfileViewDataList)]
  },
  [PolicyType.HQOS_BANDWIDTH]: {
    [PolicyOperation.CREATE]: [genAllowOperationsPath(EdgeHqosProfilesUrls.addEdgeHqosProfile)],
    [PolicyOperation.EDIT]: [genAllowOperationsPath(EdgeHqosProfilesUrls.updateEdgeHqosProfile)],
    [PolicyOperation.DELETE]: [genAllowOperationsPath(EdgeHqosProfilesUrls.deleteEdgeHqosProfile)],
    // eslint-disable-next-line max-len
    [PolicyOperation.LIST]: [genAllowOperationsPath(EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList)]
  }
}

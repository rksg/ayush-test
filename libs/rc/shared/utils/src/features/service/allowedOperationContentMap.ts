import { RbacOpsIds } from '@acx-ui/types'

import { ServiceType, ServiceOperation } from '../../constants'
import { PolicyType, PolicyOperation }   from '../../types'

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
  [PolicyType.WORKFLOW]: {
    [PolicyOperation.CREATE]: ['POST:/workflows'],
    [PolicyOperation.EDIT]: ['PATCH:/workflows/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/workflows/{id}'],
    [PolicyOperation.LIST]: ['POST:/workflows/query']
  }
}

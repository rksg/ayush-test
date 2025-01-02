import { RbacOpsIds } from '@acx-ui/types'

import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import { SvcPcyAllowedOper, SvcPcyAllowedType } from './servicePolicyAbacContentsMap'
import { ServiceOperation }                     from './serviceRouteUtils'

export type AllowedOperationMap<T extends SvcPcyAllowedType, O extends SvcPcyAllowedOper> =
  Partial<Record<T, Partial<Record<O, RbacOpsIds>>>>

export const serviceAllowedOperationMap = {
  [ServiceType.WIFI_CALLING]: {
    [ServiceOperation.CREATE]: ['POST:/wifiCallingServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/wifiCallingServiceProfiles/{serviceId}'],
    [ServiceOperation.DELETE]: ['DELETE:/wifiCallingServiceProfiles/{serviceId}'],
    [ServiceOperation.LIST]: ['POST:/wifiCallingServiceProfiles/query']
  },
  [ServiceType.DHCP]: {
    [ServiceOperation.CREATE]: ['POST:/dhcpConfigServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/dhcpConfigServiceProfiles/{serviceId}'],
    [ServiceOperation.DELETE]: ['DELETE:/dhcpConfigServiceProfiles/{serviceId}'],
    [ServiceOperation.LIST]: ['POST:/dhcpConfigServiceProfiles/query']
  },
  [ServiceType.MDNS_PROXY]: {
    [ServiceOperation.CREATE]: ['POST:/multicastDnsProxyProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/multicastDnsProxyProfiles/{serviceId}'],
    [ServiceOperation.DELETE]: ['DELETE:/multicastDnsProxyProfiles/{serviceId}'],
    [ServiceOperation.LIST]: ['POST:/multicastDnsProxyProfiles/query']
  },
  [ServiceType.DPSK]: {
    [ServiceOperation.CREATE]: ['POST:/dpskServices'],
    [ServiceOperation.EDIT]: ['PUT:/dpskServices/{serviceId}'],
    [ServiceOperation.DELETE]: ['DELETE:/dpskServices/{serviceId}'],
    [ServiceOperation.LIST]: ['GET:/dpskServices']
  },
  [ServiceType.PORTAL]: {
    [ServiceOperation.CREATE]: ['POST:/portalServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/portalServiceProfiles/{serviceId}'],
    [ServiceOperation.DELETE]: ['DELETE:/portalServiceProfiles/{serviceId}'],
    [ServiceOperation.LIST]: ['POST:/portalServiceProfiles/query']
  }
}

export const policyAllowedOperationMap = {
  [PolicyType.AAA]: {
    [PolicyOperation.CREATE]: ['POST:/radiusServerProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/radiusServerProfiles/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/radiusServerProfiles/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/radiusServerProfiles/query']
  },
  [PolicyType.CLIENT_ISOLATION]: {
    [PolicyOperation.CREATE]: ['POST:/clientIsolationProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/clientIsolationProfiles/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/clientIsolationProfiles/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/clientIsolationProfiles/query']
  },
  [PolicyType.ROGUE_AP_DETECTION]: {
    [PolicyOperation.CREATE]: ['POST:/roguePolicies'],
    [PolicyOperation.EDIT]: ['PUT:/roguePolicies/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/roguePolicies/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/roguePolicies/query']
  },
  [PolicyType.SYSLOG]: {
    [PolicyOperation.CREATE]: ['POST:/syslogServerProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/syslogServerProfiles/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/syslogServerProfiles/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/syslogServerProfiles/query']
  },
  [PolicyType.VLAN_POOL]: {
    [PolicyOperation.CREATE]: ['POST:/vlanPoolProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/vlanPoolProfiles/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/vlanPoolProfiles/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/vlanPoolProfiles/query']
  },
  [PolicyType.ACCESS_CONTROL]: {
    [PolicyOperation.CREATE]: ['POST:/accessControlProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/accessControlProfiles/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/accessControlProfiles/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/accessControlProfiles/query']
  },
  [PolicyType.LAYER_2_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/l2AclPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/l2AclPolicies/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/l2AclPolicies/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/l2AclPolicies/query']
  },
  [PolicyType.LAYER_3_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/l3AclPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/l3AclPolicies/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/l3AclPolicies/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/l3AclPolicies/query']
  },
  [PolicyType.DEVICE_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/devicePolicies'],
    [PolicyOperation.EDIT]: ['PUT:/devicePolicies/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/devicePolicies/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/devicePolicies/query']
  },
  [PolicyType.APPLICATION_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/applicationPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/applicationPolicies/{policyId}'],
    [PolicyOperation.DELETE]: ['DELETE:/applicationPolicies/{policyId}'],
    [PolicyOperation.LIST]: ['POST:/applicationPolicies/query']
  }
}

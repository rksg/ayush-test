/* eslint-disable max-len */
import { useMemo } from 'react'

import { Params, useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import {
  useAdaptivePolicyListByQueryQuery, useEnhancedRoguePoliciesQuery,
  useGetAAAPolicyViewModelListQuery, useGetApSnmpViewModelQuery,
  useGetCertificateTemplatesQuery, useGetConnectionMeteringListQuery,
  useGetEdgeHqosProfileViewDataListQuery, useGetEnhancedAccessControlProfileListQuery,
  useGetEnhancedClientIsolationListQuery, useGetEthernetPortProfileViewDataListQuery,
  useGetFlexAuthenticationProfilesQuery, useGetIdentityProviderListQuery,
  useGetLbsServerProfileListQuery, useGetSoftGreViewDataListQuery,
  useGetTunnelProfileViewDataListQuery, useGetVLANPoolPolicyViewModelListQuery,
  useSearchInProgressWorkflowListQuery,  useMacRegListsQuery, useGetDirectoryServerViewDataListQuery,
  useSyslogPolicyListQuery, useSwitchPortProfilesCountQuery, useGetWifiOperatorListQuery,
  useGetIpsecViewDataListQuery, useGetSamlIdpProfileViewDataListQuery, useAccessControlsCountQuery,
  useGetDHCPProfileListViewModelQuery, useGetDhcpStatsQuery, useGetDpskListQuery,
  useGetEdgeFirewallViewDataListQuery, useGetEdgeMdnsProxyViewDataListQuery,
  useGetEdgePinViewDataListQuery, useGetEdgeSdLanP2ViewDataListQuery,
  useGetEdgeTnmServiceListQuery, useGetEnhancedMdnsProxyListQuery,
  useGetEnhancedPortalProfileListQuery, useGetEnhancedWifiCallingServiceListQuery,
  useGetResidentPortalListQuery, useWebAuthTemplateListQuery
} from '@acx-ui/rc/services'
import { ExtendedUnifiedService, PolicyType, ServiceType, UnifiedService, UnifiedServiceType, useUnifiedServicesList } from '@acx-ui/rc/utils'

const defaultPayload = { fields: ['id'] }

export function useUnifiedServiceListWithTotalCount (): Array<ExtendedUnifiedService> {
  const unifiedServiceList = useUnifiedServicesList()

  const typeToUnifiedServiceMap = useMemo(() => {
    return new Map(unifiedServiceList.map(item => [item.type, item]))
  }, [unifiedServiceList])

  const typeToTotalCount = useUnifiedServiceTotalCountMap(typeToUnifiedServiceMap)

  return unifiedServiceList.map((service: UnifiedService) => ({
    ...service,
    totalCount: typeToTotalCount[service.type] ?? 0
  }))
}

function useUnifiedServiceTotalCountMap (
  typeMap: Map<UnifiedServiceType, UnifiedService>
): Partial<Record<UnifiedServiceType, number | undefined>> {
  const params = useParams()
  const enableWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  // eslint-disable-next-line
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const defaultQueryArgs = { params, payload: defaultPayload, enableRbac }

  return {
    [PolicyType.AAA]: useGetAAAPolicyViewModelListQuery(defaultQueryArgs, { skip: typeMap.get(PolicyType.AAA)?.disabled }).data?.totalCount,
    [PolicyType.ACCESS_CONTROL]: useAclTotalCount(typeMap.get(PolicyType.ACCESS_CONTROL)?.disabled),
    [PolicyType.CLIENT_ISOLATION]: useGetEnhancedClientIsolationListQuery(defaultQueryArgs, { skip: typeMap.get(PolicyType.CLIENT_ISOLATION)?.disabled }).data?.totalCount,
    [PolicyType.WIFI_OPERATOR]: useGetWifiOperatorListQuery({ params, payload: defaultPayload }, { skip: typeMap.get(PolicyType.WIFI_OPERATOR)?.disabled }).data?.totalCount,
    [PolicyType.SAML_IDP]: useSamlTotalCount(params, typeMap.get(PolicyType.SAML_IDP)?.disabled),
    [PolicyType.IDENTITY_PROVIDER]: useGetIdentityProviderListQuery( { params, payload: { tenantId: params.tenantId } }, { skip: typeMap.get(PolicyType.IDENTITY_PROVIDER)?.disabled }).data?.totalCount,
    [PolicyType.MAC_REGISTRATION_LIST]: useMacRegListsQuery({ params }, { skip: typeMap.get(PolicyType.MAC_REGISTRATION_LIST)?.disabled }).data?.totalCount,
    [PolicyType.ROGUE_AP_DETECTION]: useEnhancedRoguePoliciesQuery(defaultQueryArgs, { skip: typeMap.get(PolicyType.ROGUE_AP_DETECTION)?.disabled }).data?.totalCount,
    [PolicyType.SYSLOG]: useSyslogPolicyListQuery(defaultQueryArgs, { skip: typeMap.get(PolicyType.SYSLOG)?.disabled }).data?.totalCount,
    [PolicyType.VLAN_POOL]: useGetVLANPoolPolicyViewModelListQuery(defaultQueryArgs, { skip: typeMap.get(PolicyType.VLAN_POOL)?.disabled }).data?.totalCount,
    [PolicyType.SNMP_AGENT]: useGetApSnmpViewModelQuery({ params, payload: defaultPayload, enableRbac: enableWifiRbac, isSNMPv3PassphraseOn }, { skip: typeMap.get(PolicyType.SNMP_AGENT)?.disabled }).data?.totalCount,
    [PolicyType.TUNNEL_PROFILE]: useGetTunnelProfileViewDataListQuery({ params, payload: { ...defaultPayload } }, { skip: typeMap.get(PolicyType.TUNNEL_PROFILE)?.disabled }).data?.totalCount,
    [PolicyType.CONNECTION_METERING]: useGetConnectionMeteringListQuery({ params }, { skip: typeMap.get(PolicyType.CONNECTION_METERING)?.disabled }).data?.totalCount,
    [PolicyType.ADAPTIVE_POLICY]: useAdaptivePolicyListByQueryQuery({ params: { excludeContent: 'true', ...params }, payload: {} }, { skip: typeMap.get(PolicyType.ADAPTIVE_POLICY)?.disabled }).data?.totalCount,
    [PolicyType.LBS_SERVER_PROFILE]: useGetLbsServerProfileListQuery({ params, payload: defaultPayload }, { skip: typeMap.get(PolicyType.LBS_SERVER_PROFILE)?.disabled }).data?.totalCount,
    [PolicyType.WORKFLOW]: useSearchInProgressWorkflowListQuery({ params: { ...params, excludeContent: 'true' } }, { skip: typeMap.get(PolicyType.WORKFLOW)?.disabled }).data?.totalCount,
    [PolicyType.CERTIFICATE_TEMPLATE]: useGetCertificateTemplatesQuery({ params, payload: {} }, { skip: typeMap.get(PolicyType.CERTIFICATE_TEMPLATE)?.disabled }).data?.totalCount,
    [PolicyType.ETHERNET_PORT_PROFILE]: useGetEthernetPortProfileViewDataListQuery({ payload: {} }, { skip: typeMap.get(PolicyType.ETHERNET_PORT_PROFILE)?.disabled }).data?.totalCount,
    [PolicyType.HQOS_BANDWIDTH]: useGetEdgeHqosProfileViewDataListQuery({ params, payload: {} }, { skip: typeMap.get(PolicyType.HQOS_BANDWIDTH)?.disabled }).data?.totalCount,
    [PolicyType.SOFTGRE]: useGetSoftGreViewDataListQuery({ params, payload: {} }, { skip: typeMap.get(PolicyType.SOFTGRE)?.disabled }).data?.totalCount,
    [PolicyType.FLEX_AUTH]: useGetFlexAuthenticationProfilesQuery({ params, payload: {} }, { skip: typeMap.get(PolicyType.FLEX_AUTH)?.disabled }).data?.totalCount,
    [PolicyType.DIRECTORY_SERVER]: useGetDirectoryServerViewDataListQuery({ params, payload: {} }, { skip: typeMap.get(PolicyType.DIRECTORY_SERVER)?.disabled }).data?.totalCount,
    [PolicyType.PORT_PROFILE]: usePortProfileTotalCount(params, typeMap.get(PolicyType.PORT_PROFILE)?.disabled),
    [PolicyType.IPSEC]: useGetIpsecViewDataListQuery({ params, payload: {} }, { skip: typeMap.get(PolicyType.IPSEC)?.disabled }).data?.totalCount,
    [ServiceType.MDNS_PROXY]: useGetEnhancedMdnsProxyListQuery(defaultQueryArgs, { skip: typeMap.get(ServiceType.MDNS_PROXY)?.disabled }).data?.totalCount,
    [ServiceType.EDGE_MDNS_PROXY]: useGetEdgeMdnsProxyViewDataListQuery({ params, payload: defaultPayload }, { skip: typeMap.get(ServiceType.EDGE_MDNS_PROXY)?.disabled }).data?.totalCount,
    [ServiceType.DHCP]: useGetDHCPProfileListViewModelQuery(defaultQueryArgs, { skip: typeMap.get(ServiceType.DHCP)?.disabled }).data?.totalCount,
    [ServiceType.EDGE_DHCP]: useGetDhcpStatsQuery({ params, payload: { ...defaultPayload } },{ skip: typeMap.get(ServiceType.EDGE_DHCP)?.disabled }).data?.totalCount,
    [ServiceType.PIN]: useGetEdgePinViewDataListQuery({ params, payload: { ...defaultPayload } },{ skip: typeMap.get(ServiceType.PIN)?.disabled }).data?.totalCount,
    [ServiceType.EDGE_SD_LAN]: useGetEdgeSdLanP2ViewDataListQuery({ params, payload: { fields: ['id', 'edgeClusterId'] } },{ skip: typeMap.get(ServiceType.EDGE_SD_LAN)?.disabled }).data?.totalCount,
    [ServiceType.EDGE_TNM_SERVICE]: useGetEdgeTnmServiceListQuery({}, { skip: typeMap.get(ServiceType.EDGE_TNM_SERVICE)?.disabled }).data?.length,
    [ServiceType.EDGE_FIREWALL]: useGetEdgeFirewallViewDataListQuery({ params, payload: { ...defaultPayload } },{ skip: typeMap.get(ServiceType.EDGE_FIREWALL)?.disabled }).data?.totalCount,
    [ServiceType.DPSK]: useGetDpskListQuery({}, { skip: typeMap.get(ServiceType.DPSK)?.disabled }).data?.totalCount,
    [ServiceType.WIFI_CALLING]: useGetEnhancedWifiCallingServiceListQuery(defaultQueryArgs, { skip: typeMap.get(ServiceType.WIFI_CALLING)?.disabled }).data?.totalCount,
    [ServiceType.PORTAL]: useGetEnhancedPortalProfileListQuery(defaultQueryArgs, { skip: typeMap.get(ServiceType.PORTAL)?.disabled }).data?.totalCount,
    [ServiceType.WEBAUTH_SWITCH]: useWebAuthTemplateListQuery({ params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled }, { skip: typeMap.get(ServiceType.WEBAUTH_SWITCH)?.disabled }).data?.totalCount,
    [ServiceType.RESIDENT_PORTAL]: useGetResidentPortalListQuery({ params, payload: { filters: {} } }, { skip: typeMap.get(ServiceType.RESIDENT_PORTAL)?.disabled }).data?.totalCount
  }
}

function useAclTotalCount (isDisabled?: boolean): number | undefined {
  const params = useParams()
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const aclTotalCount = useGetEnhancedAccessControlProfileListQuery({
    params,
    payload: { ...defaultPayload, noDetails: true },
    enableRbac
  }, { skip: isDisabled || isSwitchMacAclEnabled }).data?.totalCount

  const switchMacAclTotalCount =
    Number(useGetEnhancedAccessControlProfileListQuery({
      params,
      payload: { ...defaultPayload, noDetails: true },
      enableRbac
    }, { skip: isDisabled || !isSwitchMacAclEnabled }).data?.totalCount ?? 0)
    + Number(useAccessControlsCountQuery({ params }, { skip: !isSwitchMacAclEnabled }).data ?? 0)

  return isSwitchMacAclEnabled ? switchMacAclTotalCount : aclTotalCount
}

function useSamlTotalCount (params: Readonly<Params<string>>, isDisabled?: boolean) {
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)

  return (useGetIdentityProviderListQuery(
    { params, payload: { tenantId: params.tenantId } },
    { skip: !supportHotspot20R1 }).data?.totalCount ?? 0)
    +
    (useGetSamlIdpProfileViewDataListQuery(
      { params, payload: { tenantId: params.tenantId } },
      { skip: isDisabled }).data?.totalCount ?? 0)
}

function usePortProfileTotalCount (params: Readonly<Params<string>>, isDisabled?: boolean) {
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)

  return (useSwitchPortProfilesCountQuery({ params, payload: {} }, { skip: isDisabled }).data ?? 0)
  + (useGetEthernetPortProfileViewDataListQuery({ payload: {} }, { skip: isDisabled || !isEthernetPortProfileEnabled }).data?.totalCount ?? 0)
}

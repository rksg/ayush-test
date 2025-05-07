/* eslint-disable max-len */
import { useEffect, useMemo, useState } from 'react'

import { isEqual }           from 'lodash'
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
import { ExtendedUnifiedService, PolicyType, ServiceType, UnifiedService, UnifiedServiceType, useAvailableUnifiedServicesList } from '@acx-ui/rc/utils'

const defaultPayload = { fields: ['id'] }

export function useUnifiedServiceListWithTotalCount (): Array<ExtendedUnifiedService> {
  const [ result, setResult ] = useState<Array<ExtendedUnifiedService>>([])
  const availableUnifiedServiceList = useAvailableUnifiedServicesList()

  const availableServiceTypeSet = useMemo(() => {
    return new Set(availableUnifiedServiceList.map(item => item.type))
  }, [availableUnifiedServiceList])

  const typeToTotalCount = useUnifiedServiceTotalCountMap(availableServiceTypeSet)

  useEffect(() => {
    const updatedList = availableUnifiedServiceList.map((service: UnifiedService) => ({
      ...service,
      totalCount: typeToTotalCount[service.type] ?? 0
    })).filter(service => (service.totalCount ?? 0) > 0)

    if (isEqual(updatedList, result)) return

    setResult(updatedList)

  }, [availableUnifiedServiceList, typeToTotalCount])

  return result
}

function useUnifiedServiceTotalCountMap (
  typeSet: Set<UnifiedServiceType>
): Partial<Record<UnifiedServiceType, number | undefined>> {
  const params = useParams()
  const enableWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const defaultQueryArgs = { params, payload: defaultPayload, enableRbac }

  return {
    [PolicyType.AAA]: useGetAAAPolicyViewModelListQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.AAA) }).data?.totalCount,
    [PolicyType.ACCESS_CONTROL]: useAclTotalCount(!typeSet.has(PolicyType.ACCESS_CONTROL)),
    [PolicyType.ACCESS_CONTROL_CONSOLIDATION]: useAclTotalCount(!typeSet.has(PolicyType.ACCESS_CONTROL_CONSOLIDATION)),
    [PolicyType.CLIENT_ISOLATION]: useGetEnhancedClientIsolationListQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.CLIENT_ISOLATION) }).data?.totalCount,
    [PolicyType.WIFI_OPERATOR]: useGetWifiOperatorListQuery({ params, payload: defaultPayload }, { skip: !typeSet.has(PolicyType.WIFI_OPERATOR) }).data?.totalCount,
    [PolicyType.SAML_IDP]: useSamlTotalCount(params, !typeSet.has(PolicyType.SAML_IDP)),
    [PolicyType.IDENTITY_PROVIDER]: useGetIdentityProviderListQuery( { params, payload: { tenantId: params.tenantId } }, { skip: !typeSet.has(PolicyType.IDENTITY_PROVIDER) }).data?.totalCount,
    [PolicyType.MAC_REGISTRATION_LIST]: useMacRegListsQuery({ params }, { skip: !typeSet.has(PolicyType.MAC_REGISTRATION_LIST) }).data?.totalCount,
    [PolicyType.ROGUE_AP_DETECTION]: useEnhancedRoguePoliciesQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.ROGUE_AP_DETECTION) }).data?.totalCount,
    [PolicyType.SYSLOG]: useSyslogPolicyListQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.SYSLOG) }).data?.totalCount,
    [PolicyType.VLAN_POOL]: useGetVLANPoolPolicyViewModelListQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.VLAN_POOL) }).data?.totalCount,
    [PolicyType.SNMP_AGENT]: useGetApSnmpViewModelQuery({ params, payload: defaultPayload, enableRbac: enableWifiRbac, isSNMPv3PassphraseOn }, { skip: !typeSet.has(PolicyType.SNMP_AGENT) }).data?.totalCount,
    [PolicyType.TUNNEL_PROFILE]: useGetTunnelProfileViewDataListQuery({ params, payload: { ...defaultPayload } }, { skip: !typeSet.has(PolicyType.TUNNEL_PROFILE) }).data?.totalCount,
    [PolicyType.CONNECTION_METERING]: useGetConnectionMeteringListQuery({ params }, { skip: !typeSet.has(PolicyType.CONNECTION_METERING) }).data?.totalCount,
    [PolicyType.ADAPTIVE_POLICY]: useAdaptivePolicyListByQueryQuery({ params: { excludeContent: 'true', ...params }, payload: {} }, { skip: !typeSet.has(PolicyType.ADAPTIVE_POLICY) }).data?.totalCount,
    [PolicyType.LBS_SERVER_PROFILE]: useGetLbsServerProfileListQuery({ params, payload: defaultPayload }, { skip: !typeSet.has(PolicyType.LBS_SERVER_PROFILE) }).data?.totalCount,
    [PolicyType.WORKFLOW]: useSearchInProgressWorkflowListQuery({ params: { ...params, excludeContent: 'true' } }, { skip: !typeSet.has(PolicyType.WORKFLOW) }).data?.totalCount,
    [PolicyType.CERTIFICATE_TEMPLATE]: useGetCertificateTemplatesQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.CERTIFICATE_TEMPLATE) }).data?.totalCount,
    [PolicyType.ETHERNET_PORT_PROFILE]: useGetEthernetPortProfileViewDataListQuery({ payload: {} }, { skip: !typeSet.has(PolicyType.ETHERNET_PORT_PROFILE) }).data?.totalCount,
    [PolicyType.HQOS_BANDWIDTH]: useGetEdgeHqosProfileViewDataListQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.HQOS_BANDWIDTH) }).data?.totalCount,
    [PolicyType.SOFTGRE]: useGetSoftGreViewDataListQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.SOFTGRE) }).data?.totalCount,
    [PolicyType.FLEX_AUTH]: useGetFlexAuthenticationProfilesQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.FLEX_AUTH) }).data?.totalCount,
    [PolicyType.DIRECTORY_SERVER]: useGetDirectoryServerViewDataListQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.DIRECTORY_SERVER) }).data?.totalCount,
    [PolicyType.PORT_PROFILE]: usePortProfileTotalCount(params, !typeSet.has(PolicyType.PORT_PROFILE)),
    [PolicyType.IPSEC]: useGetIpsecViewDataListQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.IPSEC) }).data?.totalCount,
    [ServiceType.MDNS_PROXY]: useGetEnhancedMdnsProxyListQuery(defaultQueryArgs, { skip: !typeSet.has(ServiceType.MDNS_PROXY) }).data?.totalCount,
    [ServiceType.EDGE_MDNS_PROXY]: useGetEdgeMdnsProxyViewDataListQuery({ params, payload: defaultPayload }, { skip: !typeSet.has(ServiceType.EDGE_MDNS_PROXY) }).data?.totalCount,
    [ServiceType.DHCP]: useGetDHCPProfileListViewModelQuery(defaultQueryArgs, { skip: !typeSet.has(ServiceType.DHCP) }).data?.totalCount,
    [ServiceType.EDGE_DHCP]: useGetDhcpStatsQuery({ params, payload: { ...defaultPayload } },{ skip: !typeSet.has(ServiceType.EDGE_DHCP) }).data?.totalCount,
    [ServiceType.PIN]: useGetEdgePinViewDataListQuery({ params, payload: { ...defaultPayload } },{ skip: !typeSet.has(ServiceType.PIN) }).data?.totalCount,
    [ServiceType.EDGE_SD_LAN]: useGetEdgeSdLanP2ViewDataListQuery({ params, payload: { fields: ['id', 'edgeClusterId'] } },{ skip: !typeSet.has(ServiceType.EDGE_SD_LAN) }).data?.totalCount,
    [ServiceType.EDGE_TNM_SERVICE]: useGetEdgeTnmServiceListQuery({}, { skip: !typeSet.has(ServiceType.EDGE_TNM_SERVICE) }).data?.length,
    [ServiceType.EDGE_FIREWALL]: useGetEdgeFirewallViewDataListQuery({ params, payload: { ...defaultPayload } },{ skip: !typeSet.has(ServiceType.EDGE_FIREWALL) }).data?.totalCount,
    [ServiceType.DPSK]: useGetDpskListQuery({}, { skip: !typeSet.has(ServiceType.DPSK) }).data?.totalCount,
    [ServiceType.WIFI_CALLING]: useGetEnhancedWifiCallingServiceListQuery(defaultQueryArgs, { skip: !typeSet.has(ServiceType.WIFI_CALLING) }).data?.totalCount,
    [ServiceType.PORTAL]: useGetEnhancedPortalProfileListQuery(defaultQueryArgs, { skip: !typeSet.has(ServiceType.PORTAL) }).data?.totalCount,
    [ServiceType.WEBAUTH_SWITCH]: useWebAuthTemplateListQuery({ params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled }, { skip: !typeSet.has(ServiceType.WEBAUTH_SWITCH) }).data?.totalCount,
    [ServiceType.RESIDENT_PORTAL]: useGetResidentPortalListQuery({ params, payload: { filters: {} } }, { skip: !typeSet.has(ServiceType.RESIDENT_PORTAL) }).data?.totalCount
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

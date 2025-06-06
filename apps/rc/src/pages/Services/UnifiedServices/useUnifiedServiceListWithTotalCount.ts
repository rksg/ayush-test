/* eslint-disable max-len */
import { useEffect, useMemo, useState } from 'react'

import { isEqual }           from 'lodash'
import { Params, useParams } from 'react-router-dom'


import { Features, useIsSplitOn }                                                                          from '@acx-ui/feature-toggle'
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
  useGetResidentPortalListQuery, useWebAuthTemplateListQuery,
  useGetEnhancedL2AclProfileListQuery, useGetEnhancedL3AclProfileListQuery,
  useGetEnhancedDeviceProfileListQuery, useGetEnhancedApplicationProfileListQuery, useGetLayer2AclsQuery
} from '@acx-ui/rc/services'
import { ExtendedUnifiedService, PolicyType, ServiceType, UnifiedService, UnifiedServiceType, useAvailableUnifiedServicesList } from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier }                                                                                           from '@acx-ui/user'

const defaultPayload = { fields: ['id'] }

type TotalCountQueryResult = { data?: { totalCount?: number }, isFetching: boolean }

export function useUnifiedServiceListWithTotalCount (): {
  unifiedServiceListWithTotalCount: Array<ExtendedUnifiedService>,
  isFetching: boolean
  } {
  const [ result, setResult ] = useState<Array<ExtendedUnifiedService>>([])
  const availableUnifiedServiceList = useAvailableUnifiedServicesList()

  const availableServiceTypeSet = useMemo(() => {
    return new Set(availableUnifiedServiceList.map(item => item.type))
  }, [availableUnifiedServiceList])

  const { typeToTotalCountQuery: typeToTotalCount, isFetching } = useUnifiedServiceTotalCountMap(availableServiceTypeSet)

  useEffect(() => {
    if (isFetching) return

    const updatedList = availableUnifiedServiceList.map((service: UnifiedService) => ({
      ...service,
      totalCount: typeToTotalCount[service.type]?.data?.totalCount
    })).filter(service => (service.totalCount ?? 0) > 0)

    if (isEqual(updatedList, result)) return

    setResult(updatedList)

  }, [availableUnifiedServiceList, typeToTotalCount, isFetching])

  return {
    unifiedServiceListWithTotalCount: result,
    isFetching
  }
}

function useUnifiedServiceTotalCountMap (
  typeSet: Set<UnifiedServiceType>
): {
  typeToTotalCountQuery: Partial<Record<UnifiedServiceType, TotalCountQueryResult>>,
  isFetching: boolean
} {
  const params = useParams()
  const enableWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const defaultQueryArgs = { params, payload: defaultPayload, enableRbac }

  const typeToTotalCountQuery: Partial<Record<UnifiedServiceType, TotalCountQueryResult>> = {
    [PolicyType.AAA]: useGetAAAPolicyViewModelListQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.AAA) }),
    [PolicyType.ACCESS_CONTROL]: useAclTotalCount(!typeSet.has(PolicyType.ACCESS_CONTROL)),
    [PolicyType.ACCESS_CONTROL_CONSOLIDATION]: useAclTotalCount(!typeSet.has(PolicyType.ACCESS_CONTROL_CONSOLIDATION)),
    [PolicyType.CLIENT_ISOLATION]: useGetEnhancedClientIsolationListQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.CLIENT_ISOLATION) }),
    [PolicyType.WIFI_OPERATOR]: useGetWifiOperatorListQuery({ params, payload: defaultPayload }, { skip: !typeSet.has(PolicyType.WIFI_OPERATOR) }),
    [PolicyType.SAML_IDP]: useSamlTotalCount(params, !typeSet.has(PolicyType.SAML_IDP)),
    [PolicyType.IDENTITY_PROVIDER]: useGetIdentityProviderListQuery( { params, payload: { tenantId: params.tenantId } }, { skip: !typeSet.has(PolicyType.IDENTITY_PROVIDER) }),
    [PolicyType.MAC_REGISTRATION_LIST]: useMacRegListsQuery({ params }, { skip: !typeSet.has(PolicyType.MAC_REGISTRATION_LIST) }),
    [PolicyType.ROGUE_AP_DETECTION]: useEnhancedRoguePoliciesQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.ROGUE_AP_DETECTION) }),
    [PolicyType.SYSLOG]: useSyslogPolicyListQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.SYSLOG) }),
    [PolicyType.VLAN_POOL]: useGetVLANPoolPolicyViewModelListQuery(defaultQueryArgs, { skip: !typeSet.has(PolicyType.VLAN_POOL) }),
    [PolicyType.SNMP_AGENT]: useGetApSnmpViewModelQuery({ params, payload: defaultPayload, enableRbac: enableWifiRbac, isSNMPv3PassphraseOn }, { skip: !typeSet.has(PolicyType.SNMP_AGENT) }),
    [PolicyType.TUNNEL_PROFILE]: useGetTunnelProfileViewDataListQuery({ params, payload: { ...defaultPayload } }, { skip: !typeSet.has(PolicyType.TUNNEL_PROFILE) }),
    [PolicyType.CONNECTION_METERING]: useGetConnectionMeteringListQuery({ params }, { skip: !typeSet.has(PolicyType.CONNECTION_METERING) }),
    [PolicyType.ADAPTIVE_POLICY]: useAdaptivePolicyListByQueryQuery({ params: { excludeContent: 'true', ...params }, payload: {} }, { skip: !typeSet.has(PolicyType.ADAPTIVE_POLICY) }),
    [PolicyType.LBS_SERVER_PROFILE]: useGetLbsServerProfileListQuery({ params, payload: defaultPayload }, { skip: !typeSet.has(PolicyType.LBS_SERVER_PROFILE) }),
    [PolicyType.WORKFLOW]: useSearchInProgressWorkflowListQuery({ params: { ...params, excludeContent: 'true' } }, { skip: !typeSet.has(PolicyType.WORKFLOW) }),
    [PolicyType.CERTIFICATE_TEMPLATE]: useGetCertificateTemplatesQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.CERTIFICATE_TEMPLATE) }),
    [PolicyType.ETHERNET_PORT_PROFILE]: useGetEthernetPortProfileViewDataListQuery({ payload: {} }, { skip: !typeSet.has(PolicyType.ETHERNET_PORT_PROFILE) }),
    [PolicyType.HQOS_BANDWIDTH]: useGetEdgeHqosProfileViewDataListQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.HQOS_BANDWIDTH) }),
    [PolicyType.SOFTGRE]: useGetSoftGreViewDataListQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.SOFTGRE) }),
    [PolicyType.FLEX_AUTH]: useGetFlexAuthenticationProfilesQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.FLEX_AUTH) }),
    [PolicyType.DIRECTORY_SERVER]: useGetDirectoryServerViewDataListQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.DIRECTORY_SERVER) }),
    [PolicyType.PORT_PROFILE]: usePortProfileTotalCount(params, !typeSet.has(PolicyType.PORT_PROFILE)),
    [PolicyType.IPSEC]: useGetIpsecViewDataListQuery({ params, payload: {} }, { skip: !typeSet.has(PolicyType.IPSEC) }),
    [ServiceType.MDNS_PROXY]: useGetEnhancedMdnsProxyListQuery(defaultQueryArgs, { skip: !typeSet.has(ServiceType.MDNS_PROXY) }),
    [ServiceType.EDGE_MDNS_PROXY]: useGetEdgeMdnsProxyViewDataListQuery({ params, payload: defaultPayload }, { skip: !typeSet.has(ServiceType.EDGE_MDNS_PROXY) }),
    [ServiceType.DHCP]: useGetDHCPProfileListViewModelQuery(defaultQueryArgs, { skip: !typeSet.has(ServiceType.DHCP) }),
    [ServiceType.EDGE_DHCP]: useGetDhcpStatsQuery({ params, payload: { ...defaultPayload } },{ skip: !typeSet.has(ServiceType.EDGE_DHCP) }),
    [ServiceType.PIN]: useGetEdgePinViewDataListQuery({ params, payload: { ...defaultPayload } },{ skip: !typeSet.has(ServiceType.PIN) }),
    [ServiceType.EDGE_SD_LAN]: useGetEdgeSdLanP2ViewDataListQuery({ params, payload: { fields: ['id', 'edgeClusterId'] } },{ skip: !typeSet.has(ServiceType.EDGE_SD_LAN) }),
    [ServiceType.EDGE_TNM_SERVICE]: useGetEdgeTnmServiceTotalCount(!typeSet.has(ServiceType.EDGE_TNM_SERVICE)),
    [ServiceType.EDGE_FIREWALL]: useGetEdgeFirewallViewDataListQuery({ params, payload: { ...defaultPayload } },{ skip: !typeSet.has(ServiceType.EDGE_FIREWALL) }),
    [ServiceType.DPSK]: useGetDpskListQuery({}, { skip: !typeSet.has(ServiceType.DPSK) }),
    [ServiceType.WIFI_CALLING]: useGetEnhancedWifiCallingServiceListQuery(defaultQueryArgs, { skip: !typeSet.has(ServiceType.WIFI_CALLING) }),
    [ServiceType.PORTAL]: useGetEnhancedPortalProfileListQuery(defaultQueryArgs, { skip: !typeSet.has(ServiceType.PORTAL) }),
    [ServiceType.WEBAUTH_SWITCH]: useWebAuthTemplateListQuery({ params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled }, { skip: !typeSet.has(ServiceType.WEBAUTH_SWITCH) }),
    [ServiceType.PORTAL_PROFILE]: usePortalProfileTotalCount(params, !typeSet.has(ServiceType.PORTAL_PROFILE)),
    [ServiceType.RESIDENT_PORTAL]: useGetResidentPortalListQuery({ params, payload: { filters: {} } }, { skip: !typeSet.has(ServiceType.RESIDENT_PORTAL) })
  }

  return {
    typeToTotalCountQuery,
    isFetching: Object.values(typeToTotalCountQuery).some(({ isFetching }) => isFetching)
  }
}

function useAclTotalCount (isDisabled?: boolean): TotalCountQueryResult {
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  const { data: aclData, isFetching: aclIsFetching } = useWifiAclTotalCount(isDisabled)

  const { data: switchMacAclData, isFetching: switchMacAclIsFetching } = useSwitchAclTotalCount(
    isDisabled || !isSwitchMacAclEnabled
  )

  const aclTotalCount = Number(aclData?.totalCount ?? 0)
  const switchMacAclTotalCount = Number(switchMacAclData?.totalCount ?? 0)

  return {
    data: { totalCount: aclTotalCount + switchMacAclTotalCount },
    isFetching: aclIsFetching || switchMacAclIsFetching
  }
}

function useWifiAclTotalCount (isDisabled?: boolean): TotalCountQueryResult {
  const params = useParams()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const requestArgs = {
    params,
    payload: { ...defaultPayload, noDetails: true },
    enableRbac
  }
  const requestOptions = {
    skip: isDisabled,
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 180
  }

  const { data: aclData, isFetching: aclIsFetching } = useGetEnhancedAccessControlProfileListQuery(requestArgs, requestOptions)
  const { data: l2AclData, isFetching: l2AclIsFetching } = useGetEnhancedL2AclProfileListQuery(requestArgs, requestOptions)
  const { data: l3AclData, isFetching: l3AclIsFetching } = useGetEnhancedL3AclProfileListQuery(requestArgs, requestOptions)
  const { data: deviceAclData, isFetching: deviceAclIsFetching } = useGetEnhancedDeviceProfileListQuery(requestArgs, requestOptions)
  const { data: appAclData, isFetching: appAclIsFetching } = useGetEnhancedApplicationProfileListQuery(requestArgs, {
    ...requestOptions,
    skip: isCore || isDisabled
  })

  const aclTotalCount = Number(aclData?.totalCount ?? 0)
  const l2AclTotalCount = Number(l2AclData?.totalCount ?? 0)
  const l3AclTotalCount = Number(l3AclData?.totalCount ?? 0)
  const deviceAclTotalCount = Number(deviceAclData?.totalCount ?? 0)
  const appAclTotalCount = Number(appAclData?.totalCount ?? 0)

  return {
    data: { totalCount: aclTotalCount + l2AclTotalCount + l3AclTotalCount + deviceAclTotalCount + appAclTotalCount },
    isFetching: aclIsFetching || l2AclIsFetching || l3AclIsFetching || deviceAclIsFetching || appAclIsFetching
  }
}

function useSwitchAclTotalCount (isDisabled?: boolean): TotalCountQueryResult {
  const params = useParams()
  const { data: switchMacAclData, isFetching: switchMacAclIsFetching } = useAccessControlsCountQuery(
    { params },
    { skip: isDisabled }
  )
  const { data: switchL2AclData, isFetching: switchL2AclIsFetching } = useGetLayer2AclsQuery(
    { params, payload: { ...defaultPayload } },
    { skip: isDisabled }
  )

  const switchMacAclTotalCount = Number(switchMacAclData ?? 0)
  const switchL2AclTotalCount = Number(switchL2AclData?.totalCount ?? 0)

  return {
    data: { totalCount: switchMacAclTotalCount + switchL2AclTotalCount },
    isFetching: switchMacAclIsFetching || switchL2AclIsFetching
  }
}

function useSamlTotalCount (params: Readonly<Params<string>>, isDisabled?: boolean): TotalCountQueryResult {
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)

  const { data: identityProviderData, isFetching: identityProviderIsFetching } = useGetIdentityProviderListQuery(
    { params, payload: { tenantId: params.tenantId } },
    { skip: !supportHotspot20R1 }
  )

  const { data: samlData, isFetching: samlIsFetching } = useGetSamlIdpProfileViewDataListQuery(
    { params, payload: { tenantId: params.tenantId } },
    { skip: isDisabled }
  )

  return {
    data: { totalCount: Number(identityProviderData?.totalCount ?? 0) + Number(samlData?.totalCount ?? 0) },
    isFetching: identityProviderIsFetching || samlIsFetching
  }
}

function usePortProfileTotalCount (params: Readonly<Params<string>>, isDisabled?: boolean): TotalCountQueryResult {
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)

  const { data: switchPortProfilesCount, isFetching: switchPortProfilesCountIsFetching } =
    useSwitchPortProfilesCountQuery({ params, payload: {} }, { skip: isDisabled })

  const { data: ethernetPortProfileData, isFetching: ethernetPortProfileIsFetching } =
    useGetEthernetPortProfileViewDataListQuery({ payload: {} }, { skip: isDisabled || !isEthernetPortProfileEnabled })

  return {
    data: { totalCount: Number(switchPortProfilesCount ?? 0) + Number(ethernetPortProfileData?.totalCount ?? 0) },
    isFetching: switchPortProfilesCountIsFetching || ethernetPortProfileIsFetching
  }
}


function useGetEdgeTnmServiceTotalCount (isDisabled?: boolean): TotalCountQueryResult {
  const { data, isFetching } = useGetEdgeTnmServiceListQuery({}, { skip: isDisabled })

  return {
    data: { totalCount: data?.length },
    isFetching
  }
}


function usePortalProfileTotalCount (params: Readonly<Params<string>>, isDisabled?: boolean) {
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const isEdgePinReady = useIsSplitOn(Features.EDGE_PIN_HA_TOGGLE)

  const { data: guestPortal, isFetching: guestPortalIsFetching } =
    useGetEnhancedPortalProfileListQuery(
      { params, payload: { filters: {} }, enableRbac: isEnabledRbacService },
      { skip: isDisabled }
    )

  const { data: pinPortal, isFetching: pinPortalIsFetching } =
    useWebAuthTemplateListQuery(
      { params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled },
      { skip: isDisabled || !isEdgePinReady || !networkSegmentationSwitchEnabled }
    )

  return {
    data: { totalCount: Number(guestPortal?.totalCount ?? 0) + Number(pinPortal?.totalCount ?? 0) },
    isFetching: guestPortalIsFetching || pinPortalIsFetching
  }
}

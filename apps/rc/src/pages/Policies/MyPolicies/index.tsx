import { useState } from 'react'

import { find }                      from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader, RadioCard, RadioCardCategory }                                                    from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed }                                      from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType, useIsEdgeFeatureReady, useIsEdgeReady } from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListByQueryQuery,
  useEnhancedRoguePoliciesQuery,
  useGetAAAPolicyViewModelListQuery,
  useGetApSnmpViewModelQuery,
  useGetCertificateTemplatesQuery,
  useGetConnectionMeteringListQuery,
  useGetEdgeHqosProfileViewDataListQuery,
  useGetEnhancedAccessControlProfileListQuery,
  useGetEnhancedClientIsolationListQuery,
  useGetEthernetPortProfileViewDataListQuery,
  useGetFlexAuthenticationProfilesQuery,
  useGetIdentityProviderListQuery,
  useGetLbsServerProfileListQuery,
  useGetSoftGreViewDataListQuery,
  useGetTunnelProfileViewDataListQuery,
  useGetVLANPoolPolicyViewModelListQuery,
  useSearchInProgressWorkflowListQuery,
  useGetWifiOperatorListQuery,
  useMacRegListsQuery,
  useSyslogPolicyListQuery,
  useGetDirectoryServerViewDataListQuery,
  useSwitchPortProfilesCountQuery
} from '@acx-ui/rc/services'
import {
  AddProfileButton,
  IncompatibilityFeatures,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  hasSomePoliciesPermission,
  isPolicyCardEnabled,
  policyTypeDescMapping,
  policyTypeLabelMapping
} from '@acx-ui/rc/utils'
import {
  Path,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

const defaultPayload = {
  fields: ['id']
}

export default function MyPolicies () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const policies = useCardData()
  const [edgeFeatureName, setEdgeFeatureName] = useState<IncompatibilityFeatures | undefined>()

  if (isEdgeCompatibilityEnabled) {
    find(policies, { type: PolicyType.TUNNEL_PROFILE })!.helpIcon = isEdgeCompatibilityEnabled
      ? <ApCompatibilityToolTip
        title=''
        showDetailButton
        onClick={() => setEdgeFeatureName(IncompatibilityFeatures.TUNNEL_PROFILE)}
      />
      : undefined
    find(policies, { type: PolicyType.HQOS_BANDWIDTH })!.helpIcon = isEdgeCompatibilityEnabled
      ? <ApCompatibilityToolTip
        title=''
        showDetailButton
        onClick={() => setEdgeFeatureName(IncompatibilityFeatures.HQOS)}
      />
      : undefined
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Policies & Profiles' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
        extra={<AddProfileButton
          hasSomeProfilesPermission={() => hasSomePoliciesPermission(PolicyOperation.CREATE)}
          linkText={$t({ defaultMessage: 'Add Policy or Profile' })}
          targetPath={getSelectPolicyRoutePath(true)}
        />}
      />
      <GridRow>
        {
          // eslint-disable-next-line max-len
          policies.filter(p => isPolicyCardEnabled(p, PolicyOperation.LIST)).map((policy, index) => {
            const title = <FormattedMessage
              defaultMessage={
                '{name} ({count})'
              }
              values={{
                name: $t(policyTypeLabelMapping[policy.type]),
                count: policy.totalCount ?? 0
              }}
            />

            return (
              <GridCol key={policy.type} col={{ span: 6 }}>
                <RadioCard
                  type={'default'}
                  key={`${policy.type}_${index}`}
                  value={policy.type}
                  title={title}
                  description={$t(policyTypeDescMapping[policy.type])}
                  categories={policy.categories}
                  onClick={() => {
                    policy.listViewPath && navigate(policy.listViewPath)
                  }}
                  helpIcon={
                    policy.helpIcon
                      ? <span style={{ marginLeft: '5px' }}>{policy.helpIcon}</span>
                      : ''
                  }
                  isBetaFeature={policy.isBetaFeature}
                />
              </GridCol>
            )
          })
        }
      </GridRow>
      {isEdgeCompatibilityEnabled && <EdgeCompatibilityDrawer
        visible={!!edgeFeatureName}
        type={EdgeCompatibilityType.ALONE}
        title={$t({ defaultMessage: 'Compatibility Requirement' })}
        featureName={edgeFeatureName}
        onClose={() => setEdgeFeatureName(undefined)}
      />}
    </>
  )
}

interface PolicyCardData {
  type: PolicyType
  categories: RadioCardCategory[]
  totalCount?: number
  listViewPath?: Path
  disabled?: boolean
  helpIcon?: React.ReactNode
  isBetaFeature?: boolean
}

function useCardData (): PolicyCardData[] {
  const params = useParams()
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)
  const isLbsFeatureEnabled = useIsSplitOn(Features.WIFI_EDA_LBS_TOGGLE)
  const isLbsFeatureTierAllowed = useIsTierAllowed(TierFeatures.LOCATION_BASED_SERVICES)
  const supportLbs = isLbsFeatureEnabled && isLbsFeatureTierAllowed
  const isEdgeEnabled = useIsEdgeReady()
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const cloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isWorkflowTierEnabled = useIsTierAllowed(Features.WORKFLOW_ONBOARD)
  const isWorkflowFFEnabled = useIsSplitOn(Features.WORKFLOW_TOGGLE)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isEdgeHqosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  // eslint-disable-next-line
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)
  // eslint-disable-next-line
  const isDirectoryServerEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_DIRECTORY_SERVER_TOGGLE)
  const isSwitchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  return [
    {
      type: PolicyType.AAA,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useGetAAAPolicyViewModelListQuery({ params, payload: {}, enableRbac }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.ACCESS_CONTROL,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedAccessControlProfileListQuery({
        params, payload: {
          ...defaultPayload,
          noDetails: true
        }, enableRbac
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })),
      disabled: isSwitchMacAclEnabled
    },
    {
      type: PolicyType.ACCESS_CONTROL,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH],
      totalCount: useGetEnhancedAccessControlProfileListQuery({
        params, payload: {
          ...defaultPayload,
          noDetails: true
        }, enableRbac
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink('/policies/accessControl/wifi'),
      disabled: !isSwitchMacAclEnabled
    },
    {
      type: PolicyType.CLIENT_ISOLATION,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedClientIsolationListQuery({
        params, payload: defaultPayload, enableRbac
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.WIFI_OPERATOR,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetWifiOperatorListQuery({
        params, payload: defaultPayload
      }, { skip: !supportHotspot20R1 }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.LIST })),
      disabled: !supportHotspot20R1
    },
    {
      type: PolicyType.IDENTITY_PROVIDER,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetIdentityProviderListQuery({
        params, payload: { tenantId: params.tenantId }
      }, { skip: !supportHotspot20R1 }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.LIST })),
      disabled: !supportHotspot20R1
    },
    {
      type: PolicyType.MAC_REGISTRATION_LIST,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useMacRegListsQuery({ params }, { skip: !cloudpathBetaEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })),
      disabled: !cloudpathBetaEnabled
    },
    {
      type: PolicyType.ROGUE_AP_DETECTION,
      categories: [RadioCardCategory.WIFI],
      totalCount: useEnhancedRoguePoliciesQuery({
        params, payload: defaultPayload, enableRbac
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.SYSLOG,
      categories: [RadioCardCategory.WIFI],
      totalCount: useSyslogPolicyListQuery({
        params, payload: { }, enableRbac
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.VLAN_POOL,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetVLANPoolPolicyViewModelListQuery(
        { params, payload: { } , enableRbac }
      ).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.SNMP_AGENT,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetApSnmpViewModelQuery({
        params, payload: defaultPayload, enableRbac: isUseRbacApi, isSNMPv3PassphraseOn
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.TUNNEL_PROFILE,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useGetTunnelProfileViewDataListQuery({
        params, payload: { ...defaultPayload }
      }, { skip: !isEdgeEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.LIST })),
      disabled: !isEdgeEnabled
    },
    {
      type: PolicyType.CONNECTION_METERING,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useGetConnectionMeteringListQuery({
        params
      }, { skip: !isConnectionMeteringEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.LIST })),
      disabled: !isConnectionMeteringEnabled
    },
    {
      type: PolicyType.ADAPTIVE_POLICY,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useAdaptivePolicyListByQueryQuery({ params: { excludeContent: 'true', ...params }, payload: {} }, { skip: !cloudpathBetaEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })),
      disabled: !cloudpathBetaEnabled
    },
    {
      type: PolicyType.LBS_SERVER_PROFILE,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetLbsServerProfileListQuery({
        params, payload: defaultPayload
      }, { skip: !supportLbs }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.LIST })),
      disabled: !supportLbs
    },
    {
      type: PolicyType.WORKFLOW,
      categories: [RadioCardCategory.WIFI],
      totalCount: useSearchInProgressWorkflowListQuery({
        params: { ...params, excludeContent: 'true' }
      }, { skip: !isWorkflowFFEnabled || !isWorkflowTierEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.WORKFLOW, oper: PolicyOperation.LIST })),
      disabled: !isWorkflowFFEnabled || !isWorkflowTierEnabled
    },
    {
      type: PolicyType.CERTIFICATE_TEMPLATE,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useGetCertificateTemplatesQuery({ params, payload: {} }, { skip: !isCertificateTemplateEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.LIST })),
      disabled: !isCertificateTemplateEnabled
    },
    {
      type: PolicyType.ETHERNET_PORT_PROFILE,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useGetEthernetPortProfileViewDataListQuery({ payload: {} }, { skip: !isEthernetPortProfileEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.LIST })),
      disabled: !isEthernetPortProfileEnabled || isSwitchPortProfileEnabled
    },
    {
      type: PolicyType.HQOS_BANDWIDTH,
      categories: [RadioCardCategory.EDGE],
      // eslint-disable-next-line max-len
      totalCount: useGetEdgeHqosProfileViewDataListQuery({ params, payload: {} }, { skip: !isEdgeHqosEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.HQOS_BANDWIDTH, oper: PolicyOperation.LIST })),
      disabled: !isEdgeHqosEnabled,
      isBetaFeature: useIsBetaEnabled(TierFeatures.EDGE_HQOS)
    },
    {
      type: PolicyType.SOFTGRE,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useGetSoftGreViewDataListQuery({ params, payload: {} }, { skip: !isSoftGreEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.SOFTGRE, oper: PolicyOperation.LIST })),
      disabled: !isSoftGreEnabled
    },
    {
      type: PolicyType.FLEX_AUTH,
      categories: [RadioCardCategory.SWITCH],
      // eslint-disable-next-line max-len
      totalCount: useGetFlexAuthenticationProfilesQuery({ params, payload: {} }, { skip: !isSwitchFlexAuthEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.FLEX_AUTH, oper: PolicyOperation.LIST })),
      disabled: !isSwitchFlexAuthEnabled
    },
    {
      type: PolicyType.DIRECTORY_SERVER,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useGetDirectoryServerViewDataListQuery({ params, payload: {} }, { skip: !isDirectoryServerEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.DIRECTORY_SERVER, oper: PolicyOperation.LIST })),
      disabled: !isDirectoryServerEnabled
    },
    {
      type: PolicyType.PORT_PROFILE,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH],
      // eslint-disable-next-line max-len
      totalCount: (useSwitchPortProfilesCountQuery({ params, payload: {} }, { skip: !isSwitchPortProfileEnabled }).data ?? 0) + (useGetEthernetPortProfileViewDataListQuery({ payload: {} }, { skip: !isEthernetPortProfileEnabled }).data?.totalCount ?? 0),
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink('/policies/portProfile/wifi'),
      disabled: !isSwitchPortProfileEnabled
    }
  ]
}

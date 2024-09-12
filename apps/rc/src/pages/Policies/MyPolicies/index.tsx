import { useState } from 'react'

import { find }                      from 'lodash'
import { useIntl, FormattedMessage } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCard, RadioCardCategory }                                            from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                                                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady, useIsEdgeReady, ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType } from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListByQueryQuery,
  useEnhancedRoguePoliciesQuery,
  useGetAAAPolicyViewModelListQuery,
  useGetApSnmpViewModelQuery,
  useGetCertificateTemplatesQuery,
  useGetConnectionMeteringListQuery,
  useGetEdgeQosProfileViewDataListQuery,
  useGetEnhancedAccessControlProfileListQuery,
  useGetEnhancedClientIsolationListQuery,
  useGetIdentityProviderListQuery,
  useGetLbsServerProfileListQuery,
  useGetTunnelProfileViewDataListQuery,
  useGetVLANPoolPolicyViewModelListQuery,
  useGetWifiOperatorListQuery,
  useMacRegListsQuery,
  useSyslogPolicyListQuery,
  useGetSoftGreViewDataListQuery
} from '@acx-ui/rc/services'
import {
  IncompatibilityFeatures,
  PolicyOperation,
  PolicyType,
  ServicePolicyCardData,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  isServicePolicyCardEnabled,
  policyTypeDescMapping,
  policyTypeLabelMapping,
  servicePolicyCardDataToScopeKeys
} from '@acx-ui/rc/utils'
import {
  TenantLink,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

const defaultPayload = {
  fields: ['id']
}

export default function MyPolicies () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const policies: ServicePolicyCardData<PolicyType>[] = useCardData()
  const [edgeFeatureName, setEdgeFeatureName] = useState<IncompatibilityFeatures | undefined>()

  if (isEdgeCompatibilityEnabled) {
    find(policies, { type: PolicyType.TUNNEL_PROFILE })!.helpIcon = isEdgeCompatibilityEnabled
      ? <ApCompatibilityToolTip
        title=''
        visible
        onClick={() => setEdgeFeatureName(IncompatibilityFeatures.TUNNEL_PROFILE)}
      />
      : undefined
  }

  const allPoliciesScopeKeysForCreate = servicePolicyCardDataToScopeKeys(policies, 'create')

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Policies & Profiles' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
        extra={filterByAccess([
          <TenantLink to={getSelectPolicyRoutePath(true)} scopeKey={allPoliciesScopeKeysForCreate}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Policy or Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        {
          // eslint-disable-next-line max-len
          policies.filter(p => isServicePolicyCardEnabled<PolicyType>(p, 'read')).map((policy, index) => {
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

function useCardData (): ServicePolicyCardData<PolicyType>[] {
  const params = useParams()
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)
  const supportLbs = useIsSplitOn(Features.WIFI_EDA_LBS_TOGGLE)
  const isEdgeEnabled = useIsEdgeReady()
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const cloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isEdgeQosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)

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
        params, payload: defaultPayload, enableRbac
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST }))
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
        params, payload: defaultPayload, enableRbac: isUseRbacApi
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
      type: PolicyType.CERTIFICATE_TEMPLATE,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useGetCertificateTemplatesQuery({ params, payload: {} }, { skip: !isCertificateTemplateEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.LIST })),
      disabled: !isCertificateTemplateEnabled
    },
    {
      type: PolicyType.QOS_BANDWIDTH,
      categories: [RadioCardCategory.EDGE],
      // eslint-disable-next-line max-len
      totalCount: useGetEdgeQosProfileViewDataListQuery({ params, payload: {} }, { skip: !isEdgeQosEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.QOS_BANDWIDTH, oper: PolicyOperation.LIST })),
      disabled: !isEdgeQosEnabled
    },
    {
      type: PolicyType.SOFTGRE,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useGetSoftGreViewDataListQuery({ params, payload: {} }, { skip: !isSoftGreEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.SOFTGRE, oper: PolicyOperation.LIST })),
      disabled: !isSoftGreEnabled
    }
  ]
}
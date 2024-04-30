import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCard, RadioCardCategory } from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }             from '@acx-ui/feature-toggle'
import {
  useGetEnhancedAccessControlProfileListQuery,
  useGetAAAPolicyViewModelListQuery,
  useGetVLANPoolPolicyViewModelListQuery,
  useEnhancedRoguePoliciesQuery,
  useGetApSnmpViewModelQuery,
  useGetEnhancedClientIsolationListQuery,
  useGetIdentityProviderListQuery,
  useSyslogPolicyListQuery,
  useMacRegListsQuery,
  useGetTunnelProfileViewDataListQuery,
  useGetConnectionMeteringListQuery,
  useAdaptivePolicyListQuery,
  useGetCertificateTemplatesQuery,
  useGetWifiOperatorListQuery
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  policyTypeLabelMapping, policyTypeDescMapping
} from '@acx-ui/rc/utils'
import {
  Path,
  TenantLink,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes, WifiScopes }        from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'

interface CardDataProps {
  type: PolicyType
  categories: RadioCardCategory[]
  totalCount?: number
  listViewPath: Path
  disabled?: boolean
}

const defaultPayload = {
  fields: ['id']
}

export default function MyPolicies () {
  const { $t } = useIntl()
  const navigate = useNavigate()

  const policies: CardDataProps[] = useCardData()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Policies & Profiles' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
        extra={filterByAccess([
          <TenantLink to={getSelectPolicyRoutePath(true)}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Policy or Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        {policies.filter(policy => !policy.disabled).map((policy, index) => {
          return (
            <GridCol key={policy.type} col={{ span: 6 }}>
              <RadioCard
                type={'default'}
                key={`${policy.type}_${index}`}
                value={policy.type}
                title={$t({
                  defaultMessage: '{name} ({count})'
                }, {
                  name: $t(policyTypeLabelMapping[policy.type]),
                  count: policy.totalCount ?? 0
                })}
                description={$t(policyTypeDescMapping[policy.type])}
                categories={policy.categories}
                onClick={() => {
                  navigate(policy.listViewPath)
                }}
              />
            </GridCol>
          )
        })}
      </GridRow>
    </>
  )
}

function useCardData (): CardDataProps[] {
  const params = useParams()
  const supportApSnmp = useIsSplitOn(Features.AP_SNMP)
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const cloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)

  return [
    {
      type: PolicyType.AAA,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetAAAPolicyViewModelListQuery({ params, payload: { } }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.ACCESS_CONTROL,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedAccessControlProfileListQuery({
        params, payload: defaultPayload
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.CLIENT_ISOLATION,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedClientIsolationListQuery({
        params, payload: defaultPayload
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
        params, payload: defaultPayload
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.SYSLOG,
      categories: [RadioCardCategory.WIFI],
      totalCount: useSyslogPolicyListQuery({
        params, payload: { }
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.VLAN_POOL,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetVLANPoolPolicyViewModelListQuery({ params, payload: { } }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.SNMP_AGENT,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetApSnmpViewModelQuery({
        params, payload: { ...defaultPayload }
      }, { skip: !supportApSnmp }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })),
      disabled: !supportApSnmp
    },
    {
      type: PolicyType.TUNNEL_PROFILE,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useGetTunnelProfileViewDataListQuery({
        params, payload: { ...defaultPayload }
      }, { skip: !isEdgeEnabled || !isEdgeReady }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.LIST })),
      disabled: !isEdgeEnabled || !isEdgeReady
    },
    {
      type: PolicyType.CONNECTION_METERING,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useGetConnectionMeteringListQuery({
        params
      }, { skip: !isConnectionMeteringEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.LIST })),
      disabled: !isConnectionMeteringEnabled ||
        !hasPermission({ scopes: [WifiScopes.READ, EdgeScopes.READ] })
    },
    {
      type: PolicyType.ADAPTIVE_POLICY,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useAdaptivePolicyListQuery({ params, payload: {} }, { skip: !cloudpathBetaEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })),
      disabled: !cloudpathBetaEnabled
    },
    {
      type: PolicyType.CERTIFICATE_TEMPLATE,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useGetCertificateTemplatesQuery({ params, payload: {} }, { skip: !isCertificateTemplateEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.LIST })),
      disabled: !isCertificateTemplateEnabled
    }
  ]
}

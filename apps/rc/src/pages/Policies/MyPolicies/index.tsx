import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCard, RadioCardCategory } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                           from '@acx-ui/feature-toggle'
import {
  useGetEnhancedAccessControlProfileListQuery,
  useGetAAAPolicyViewModelListQuery,
  useGetVLANPoolPolicyViewModelListQuery,
  useEnhancedRoguePoliciesQuery,
  useGetApSnmpViewModelQuery,
  useGetEnhancedClientIsolationListQuery,
  useSyslogPolicyListQuery,
  useMacRegListsQuery,
  useGetTunnelProfileViewDataListQuery,
  useGetConnectionMeteringListQuery,
  useAdaptivePolicyListQuery
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import {
  Path,
  TenantLink,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import {
  policyTypeDescMapping,
  policyTypeLabelMapping
} from '../contentsMap'

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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const policies: CardDataProps[] = useCardData()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Policies & Profiles' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) }
        ]: undefined}
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
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const cloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

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
      disabled: !isConnectionMeteringEnabled
    },
    {
      type: PolicyType.ADAPTIVE_POLICY,
      categories: [RadioCardCategory.WIFI],
      // eslint-disable-next-line max-len
      totalCount: useAdaptivePolicyListQuery({ params, payload: {} }, { skip: !cloudpathBetaEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })),
      disabled: !cloudpathBetaEnabled
    }
  ]
}

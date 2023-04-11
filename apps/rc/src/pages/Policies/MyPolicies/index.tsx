import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCard, RadioCardCategory } from '@acx-ui/components'
import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import {
  useGetEnhancedAccessControlProfileListQuery,
  useGetAAAPolicyViewModelListQuery,
  useGetVLANPoolPolicyViewModelListQuery,
  useEnhancedRoguePoliciesQuery,
  useGetApSnmpViewModelQuery,
  useGetEnhancedClientIsolationListQuery,
  useSyslogPolicyListQuery,
  useMacRegListsQuery
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

  const policies: CardDataProps[] = useCardData()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Policies & Profiles' })}
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
  const macRegistrationEnabled = useIsSplitOn(Features.MAC_REGISTRATION)
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

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
      totalCount: useMacRegListsQuery({ params }, { skip: !macRegistrationEnabled }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })),
      disabled: !macRegistrationEnabled
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
      totalCount: 0,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.LIST })),
      disabled: !isEdgeEnabled
    }
  ]
}

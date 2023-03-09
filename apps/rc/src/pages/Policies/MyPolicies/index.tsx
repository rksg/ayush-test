import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCard, RadioCardCategory } from '@acx-ui/components'
import {
  useEnhancedRoguePoliciesQuery,
  useSyslogPolicyListQuery,
  usePolicyListQuery
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
  category: RadioCardCategory
  totalCount?: number
  listViewPath: Path
  disabled?: boolean
}

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'type',
    'scope',
    'cog'
  ]
}

const defaultRoguePayload = {
  searchString: '',
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
                categories={[policy.category]}
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

  return [
    {
      type: PolicyType.AAA,
      category: RadioCardCategory.WIFI,
      totalCount: usePolicyListQuery({ // TODO should invoke self List API here when API is ready
        params, payload: { ...defaultPayload, filters: { type: [PolicyType.AAA] } }
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.ACCESS_CONTROL,
      category: RadioCardCategory.WIFI,
      totalCount: usePolicyListQuery({ // TODO should invoke self List API here when API is ready
        params, payload: { ...defaultPayload, filters: { type: [PolicyType.ACCESS_CONTROL] } }
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.CLIENT_ISOLATION,
      category: RadioCardCategory.WIFI,
      totalCount: usePolicyListQuery({ // TODO should invoke self List API here when API is ready
        params, payload: { ...defaultPayload, filters: { type: [PolicyType.CLIENT_ISOLATION] } }
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.MAC_REGISTRATION_LIST,
      category: RadioCardCategory.WIFI,
      totalCount: usePolicyListQuery({ // TODO should invoke self List API here when API is ready
        // eslint-disable-next-line max-len
        params, payload: { ...defaultPayload, filters: { type: [PolicyType.MAC_REGISTRATION_LIST] } }
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })),
      disabled: true
    },
    {
      type: PolicyType.ROGUE_AP_DETECTION,
      category: RadioCardCategory.WIFI,
      totalCount: useEnhancedRoguePoliciesQuery({
        params, payload: { ...defaultRoguePayload }
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.SYSLOG,
      category: RadioCardCategory.WIFI,
      totalCount: useSyslogPolicyListQuery({
        params, payload: { }
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST }))
    },
    {
      type: PolicyType.VLAN_POOL,
      category: RadioCardCategory.WIFI,
      totalCount: usePolicyListQuery({ // TODO should invoke self List API here when API is ready
        params, payload: { ...defaultPayload, filters: { type: [PolicyType.VLAN_POOL] } }
      }).data?.totalCount,
      // eslint-disable-next-line max-len
      listViewPath: useTenantLink(getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST }))
    }
  ]
}

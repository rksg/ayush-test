import { useIntl } from 'react-intl'

import { Button, PageHeader }       from '@acx-ui/components'
import {
  PolicyType,
  PolicyOperation,
  usePoliciesBreadcrumb,
  getPolicyRoutePath, getScopeKeyByPolicy, filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  policyTypeLabelWithCountMapping
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { PROFILE_MAX_COUNT_ACCESS_CONTROL } from '../constants'
import { useWifiAclTotalCount }             from '../counterUtils'

import AccessControlTabs from './AccessControlTabs'

export function AccessControlTable () {
  const { $t } = useIntl()

  const { data, isFetching } = useWifiAclTotalCount(false)
  const { aclCount = 0 } = data ?? {}

  return (<>
    <PageHeader
      title={
        $t(
          policyTypeLabelWithCountMapping[PolicyType.ACCESS_CONTROL],
          { count: isFetching ? '' : data?.totalCount }
        )
      }
      breadcrumb={usePoliciesBreadcrumb()}
      extra={filterByAccessForServicePolicyMutation([
        <TenantLink
          to={getPolicyRoutePath({
            type: PolicyType.ACCESS_CONTROL,
            oper: PolicyOperation.CREATE
          })}
          scopeKey={getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)}
          rbacOpsIds={getPolicyAllowedOperation(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)}
        >
          <Button
            type='primary'
            disabled={isFetching || aclCount >= PROFILE_MAX_COUNT_ACCESS_CONTROL}>
            {$t({ defaultMessage: 'Add Access Control Set' })}
          </Button>
        </TenantLink>
      ])}

    />
    <AccessControlTabs />
  </>)
}

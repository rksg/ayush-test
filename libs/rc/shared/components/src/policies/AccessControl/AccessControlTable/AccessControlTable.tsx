import React from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader }                          from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { useGetEnhancedAccessControlProfileListQuery } from '@acx-ui/rc/services'
import {
  PolicyType,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath, useTableQuery, getScopeKeyByPolicy, filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { PROFILE_MAX_COUNT_ACCESS_CONTROL } from '../constants'

import AccessControlTabs from './AccessControlTabs'

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name'
  ]
}

export function AccessControlTable () {
  const { $t } = useIntl()

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload,
    enableRbac
  })

  return (<>
    <PageHeader
      title={
        $t({
          defaultMessage: 'Access Control'
        })
      }
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }
      ]}
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
            disabled={tableQuery.data?.totalCount! >= PROFILE_MAX_COUNT_ACCESS_CONTROL}>
            {$t({ defaultMessage: 'Add Access Control Set' })}
          </Button>
        </TenantLink>
      ])}

    />
    <AccessControlTabs />
  </>)
}

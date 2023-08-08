import React from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader }                          from '@acx-ui/components'
import { useGetEnhancedAccessControlProfileListQuery } from '@acx-ui/rc/services'
import {
  PolicyType,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { PROFILE_MAX_COUNT_ACCESS_CONTROL } from '../constants'

import AccessControlTabs from './AccessControlTabs'

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name'
  ]
}

export default function AccessControlTable () {
  const { $t } = useIntl()

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload
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
      extra={filterByAccess([
        <TenantLink
          to={getPolicyRoutePath({
            type: PolicyType.ACCESS_CONTROL,
            oper: PolicyOperation.CREATE
          })}>
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


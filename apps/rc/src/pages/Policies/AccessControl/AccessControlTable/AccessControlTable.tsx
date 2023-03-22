import React from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import {
  PolicyType,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import AccessControlTabs from './AccessControlTabs'

export default function AccessControlTable () {
  const { $t } = useIntl()

  return (
    <PageHeader
      title={
        $t({
          defaultMessage: 'Access Control'
        })
      }
      breadcrumb={[
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
          <Button type='primary'>{$t({ defaultMessage: 'Add Access Control Set' })}</Button>
        </TenantLink>
      ])}
      footer={<AccessControlTabs />}
    />
  )
}


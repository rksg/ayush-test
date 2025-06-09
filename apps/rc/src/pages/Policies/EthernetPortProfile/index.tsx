/* eslint-disable max-len */

import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  usePoliciesBreadcrumb,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import EthernetPortProfileTable from './EthernetPortProfileTable'


const EthernetPortProfile = () => {
  const { $t } = useIntl()
  const [tableTotalCount, setTableTotalCount] = useState<number>(0)

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Ethernet Port Profile ({count})' },
            { count: tableTotalCount }
          )
        }
        breadcrumb={usePoliciesBreadcrumb()}

        extra={
          filterByAccessForServicePolicyMutation([
            <TenantLink
              scopeKey={getScopeKeyByPolicy(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.CREATE)}
              rbacOpsIds={getPolicyAllowedOperation(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.CREATE)}
              to={getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE , oper: PolicyOperation.CREATE })}
            >
              <Button type='primary'>{$t({ defaultMessage: 'Add Ethernet Port Profile' })}</Button>
            </TenantLink>
          ])}
      />
      <EthernetPortProfileTable setTableTotalCount={setTableTotalCount} />
    </>
  )
}

export default EthernetPortProfile

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { useGetVLANPoolPolicyDetailQuery }              from '@acx-ui/rc/services'
import {
  VLANPoolPolicyType,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  getPolicyRoutePath,
  getPolicyListRoutePath
}   from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import VLANPoolInstancesTable from './VLANPoolInstancesTable'
import VLANPoolOverview       from './VLANPoolOverview'

export default function VLANPoolDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const queryResults = useGetVLANPoolPolicyDetailQuery({ params })
  const tablePath = getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST })

  return (
    <>
      <PageHeader
        title={queryResults.data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'VLAN Pools' }), link: tablePath }
        ]}
        extra={filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.VLAN_POOL,
            oper: PolicyOperation.EDIT,
            policyId: queryResults.data?.id||''
          })}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[queryResults]}>
            <VLANPoolOverview vlanPoolProfile={queryResults.data as VLANPoolPolicyType} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <VLANPoolInstancesTable/>
        </GridCol>
      </GridRow>
    </>
  )
}

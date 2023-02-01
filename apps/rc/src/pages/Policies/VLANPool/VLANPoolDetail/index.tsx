import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { useGetVLANPoolPolicyDetailQuery }              from '@acx-ui/rc/services'
import {
  VLANPoolPolicyType,
  getPolicyListRoutePath,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation
}   from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import VLANPoolInstancesTable from './VLANPoolInstancesTable'
import VLANPoolOverview       from './VLANPoolOverview'

export default function VLANPoolDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const queryResults = useGetVLANPoolPolicyDetailQuery({ params })
  return (
    <>
      <PageHeader
        title={queryResults.data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath() }
        ]}
        extra={[
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.VLAN_POOL,
            oper: PolicyOperation.EDIT,
            policyId: queryResults.data?.id||''
          })}>

            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ]}
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

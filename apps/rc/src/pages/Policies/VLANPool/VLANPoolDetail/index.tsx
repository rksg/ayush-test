import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { useGetVLANPoolProfileDetailQuery }             from '@acx-ui/rc/services'
import { VLANPoolPolicyType, getPolicyListRoutePath }   from '@acx-ui/rc/utils'
import { TenantLink }                                   from '@acx-ui/react-router-dom'

import VLANPoolInstancesTable from './VLANPoolInstancesTable'
import VLANPoolOverview       from './VLANPoolOverview'

export default function VLANPoolDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const queryResults = useGetVLANPoolProfileDetailQuery({ params })
  return (
    <>
      <PageHeader
        title={queryResults.data?.policyName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath() }
        ]}
        extra={[
          <TenantLink to={`/policies/vlanPool/${queryResults.data?.id}/edit`} key='edit'>
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

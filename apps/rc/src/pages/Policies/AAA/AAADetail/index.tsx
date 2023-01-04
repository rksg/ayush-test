import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { useGetAAAProfileDetailQuery }                  from '@acx-ui/rc/services'
import { AAAPolicyType, getPolicyListRoutePath }        from '@acx-ui/rc/utils'
import { TenantLink }                                   from '@acx-ui/react-router-dom'

import AAAInstancesTable from './AAAInstancesTable'
import AAAOverview       from './AAAOverview'

export default function AAAPolicyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const queryResults = useGetAAAProfileDetailQuery({ params })
  return (
    <>
      <PageHeader
        title={queryResults.data?.profileName||''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath() }
        ]}
        extra={[
          <TenantLink to={`/policies/aaa/${queryResults.data?.id}/edit`} key='edit'>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ]}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[queryResults]}>
            <AAAOverview aaaProfile={queryResults.data as AAAPolicyType} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <AAAInstancesTable/>
        </GridCol>
      </GridRow>
    </>
  )
}

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol }             from '@acx-ui/components'
import { useAaaNetworkInstancesQuery, useGetAAAProfileDetailQuery } from '@acx-ui/rc/services'
import { AAAPolicyType, getPolicyListRoutePath, useTableQuery }     from '@acx-ui/rc/utils'
import { TenantLink }                                               from '@acx-ui/react-router-dom'

import AAAInstancesTable from './AAAInstancesTable'
import AAAOverview       from './AAAOverview'



const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export default function AAAPolicyDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: useAaaNetworkInstancesQuery,
    defaultPayload
  })

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
          <Loader states={[tableQuery]}>
            <AAAInstancesTable
              dataSource={tableQuery.data?.data}
              pagination={tableQuery.pagination}
              onChange={tableQuery.handleTableChange}
            />
          </Loader>
        </GridCol>
      </GridRow>
    </>
  )
}

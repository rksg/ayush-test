import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, DisabledButton, GridRow, Loader }            from '@acx-ui/components'
import { ClockOutlined }                                                  from '@acx-ui/icons'
import { usePortalNetworkInstancesQuery, useGetPortalProfileDetailQuery } from '@acx-ui/rc/services'
import { Demo, useTableQuery }                                            from '@acx-ui/rc/utils'
import { TenantLink }                                                     from '@acx-ui/react-router-dom'

import PortalInstancesTable from './PortalInstancesTable'
import PortalOverview       from './PortalOverview'



const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export default function PortalServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: usePortalNetworkInstancesQuery,
    defaultPayload
  })

  const queryResults = useGetPortalProfileDetailQuery({ params })


  return (
    <>
      <PageHeader
        title={queryResults.data?.serviceName||''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={[
          <DisabledButton key={'last24'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </DisabledButton>,
          <TenantLink to={`/services/portal/${queryResults.data?.id}/edit`} key='edit'>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ]}
      />
      <GridRow>
        <Loader states={[queryResults]}>
          <PortalOverview demoValue={queryResults.data?.demo as Demo} />
        </Loader>
      </GridRow>

      <GridRow style={{ marginTop: 25 }}>
        <Loader states={[tableQuery]}>
          <PortalInstancesTable
            dataSource={tableQuery.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
        </Loader>
      </GridRow>
    </>
  )
}

import { Row }       from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button }                                             from '@acx-ui/components'
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

  const { data } = useGetPortalProfileDetailQuery({ params })


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Portal Service' })+' '+data?.serviceName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={[
          <Button size='large' key={'last24'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </Button>,
          <TenantLink to={`/services/portal/${data?.id}/edit`} key='edit'>
            <Button size='large'key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ]}
      />
      <Row>
        <PortalOverview demoValue={data?.demo as Demo} />
      </Row>

      <Row style={{ marginTop: 25 }}>
        <PortalInstancesTable
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
        />
      </Row>
    </>
  )
}

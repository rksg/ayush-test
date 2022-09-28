import { Row }       from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button }                                       from '@acx-ui/components'
import { ClockOutlined }                                            from '@acx-ui/icons'
import { useDhcpVenueInstancesQuery, useGetDHCPProfileDetailQuery } from '@acx-ui/rc/services'
import { useTableQuery }                                            from '@acx-ui/rc/utils'

import DHCPInstancesTable from './DHCPInstancesTable'
import DHCPOverview       from './DHCPOverview'


const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export default function DHCPServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: useDhcpVenueInstancesQuery,
    defaultPayload
  })

  const { data } = useGetDHCPProfileDetailQuery({ params })


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'DHCP Service' })+params.serviceId}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={[
          <Button size='large' key={'last24'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </Button>,
          <Button size='large'key={'configure'} type={'primary'}>
            {$t({ defaultMessage: 'Configure' })}
          </Button>
        ]}
      />
      <Row>
        <DHCPOverview poolNumber={data?.dhcpPools.length} />
      </Row>

      <Row style={{ marginTop: 25 }}>
        <DHCPInstancesTable
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
        />
      </Row>
    </>
  )
}


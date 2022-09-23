import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button }        from '@acx-ui/components'
import { ClockOutlined }             from '@acx-ui/icons'
import { useDhcpServiceDetailQuery } from '@acx-ui/rc/services'
import { useTableQuery }             from '@acx-ui/rc/utils'

import DHCPInstancesTable from './DHCPInstancesTable'
import DHCPOverview       from './DHCPOverview'


export default function DHCPServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: useDhcpServiceDetailQuery,
    defaultPayload: {}
  })

  // const data = [
  //   {
  //     id: '0',
  //     venueName: 0,
  //     aps: 15,
  //     switches: 3,
  //     health: 0.9,
  //     successfulAllocations: 90,
  //     unsuccessfulAllocations: 23,
  //     droppedPackets: 93,
  //     capacity: 69
  //   }
  // ] as DHCPDetailInstances[]
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
      <DHCPOverview poolNumber={4}/>
      <DHCPInstancesTable
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        style={{ paddingTop: 25 }}/>

    </>
  )
}


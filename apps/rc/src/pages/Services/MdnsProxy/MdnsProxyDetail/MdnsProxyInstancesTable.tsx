import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { Card, Table, TableProps, GridRow, GridCol } from '@acx-ui/components'
import { useApListQuery }                            from '@acx-ui/rc/services'
import { AP, useTableQuery }                         from '@acx-ui/rc/utils'
import { TenantLink }                                from '@acx-ui/react-router-dom'
import { formatter }                                 from '@acx-ui/utils'

export function MdnsProxyInstancesTable () {
  const { $t } = useIntl()
  // const params = useParams()
  const bytesFormatter = formatter('bytesFormat')

  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      fields: ['name', 'model', 'apMac', 'venueName', 'venueId', 'clients', 'serialNumber']
      // filters: { mdnsProxyServiceId: [params.serviceId] } // TODO: API is not ready
    }
  })

  const columns: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (data, row) => {
        // eslint-disable-next-line max-len
        return <TenantLink to={`/devices/aps/${row.serialNumber}/details/overview`}>{data}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      key: 'venueName',
      sorter: true,
      render: (data, row) => {
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Rx packets/bytes' }),
      dataIndex: 'rx',
      key: 'rx',
      sorter: true,
      render: () => {
        // TODO: API is not ready, this is mocked data for display
        return (
          <>
            {1000}
            <Divider type='vertical' />
            {bytesFormatter(860000)}
          </>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Tx packets/bytes' }),
      dataIndex: 'tx',
      key: 'tx',
      sorter: true,
      render: () => {
        // TODO: API is not ready, this is mocked data for display
        return (
          <>
            {1500}
            <Divider type='vertical' />
            {bytesFormatter(1060000)}
          </>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Client queries' }),
      dataIndex: 'clientQueries',
      key: 'clientQueries',
      sorter: true,
      render: () => {
        // TODO: API is not ready, this is mocked data for display
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'Server responses' }),
      dataIndex: 'serverResponses',
      key: 'serverResponses',
      sorter: true,
      render: () => {
        // TODO: API is not ready, this is mocked data for display
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'Types of mDNS services' }),
      dataIndex: 'typesCount',
      key: 'typesCount',
      sorter: true,
      render: () => {
        // TODO: API is not ready, this is mocked data for display
        return 0
      }
    }
  ]

  return (
    // eslint-disable-next-line max-len
    <Card title={$t({ defaultMessage: 'Instances ({instanceCount})' }, { instanceCount: tableQuery.data?.data.length })}>
      <GridRow gutter={[0, 16]} style={{ width: '100%' }}>
        <GridCol col={{ span: 24 }}>
          <Table<AP>
            columns={columns}
            dataSource={tableQuery.data?.data}
            rowKey='serialNumber'
          />
        </GridCol>
      </GridRow>
    </Card>
  )
}

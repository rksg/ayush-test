// import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { Card, Table, TableProps } from '@acx-ui/components'
// import { formatter }               from '@acx-ui/formatter'
import { useApListQuery }    from '@acx-ui/rc/services'
import { AP, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }        from '@acx-ui/react-router-dom'

interface MdnsProxyInstancesTableProps {
  apList: string[] | null
}

export function MdnsProxyInstancesTable (props: MdnsProxyInstancesTableProps) {
  const { $t } = useIntl()
  const { apList } = props
  // const bytesFormatter = formatter('bytesFormat')

  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      fields: ['name', 'model', 'apMac', 'venueName', 'venueId', 'clients', 'serialNumber'],
      filters: { serialNumber: apList ? apList : [''] }
    }
  })

  const columns: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>
          {row.name}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      key: 'venueName',
      sorter: true,
      render: (_, row) => {
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      }
    }
    // {
    //   title: $t({ defaultMessage: 'Rx Packets/Bytes' }),
    //   dataIndex: 'rx',
    //   key: 'rx',
    //   sorter: true,
    //   render: () => {
    //     // TODO: API is not ready, this is mocked data for display
    //     return (
    //       <>
    //         {1000}
    //         <Divider type='vertical' />
    //         {bytesFormatter(860000)}
    //       </>
    //     )
    //   }
    // },
    // {
    //   title: $t({ defaultMessage: 'Tx Packets/Bytes' }),
    //   dataIndex: 'tx',
    //   key: 'tx',
    //   sorter: true,
    //   render: () => {
    //     // TODO: API is not ready, this is mocked data for display
    //     return (
    //       <>
    //         {1500}
    //         <Divider type='vertical' />
    //         {bytesFormatter(1060000)}
    //       </>
    //     )
    //   }
    // }
    // {
    //   title: $t({ defaultMessage: 'Client Queries' }),
    //   dataIndex: 'clientQueries',
    //   key: 'clientQueries',
    //   sorter: true,
    //   render: () => {
    //     // TODO: API is not ready, this is mocked data for display
    //     return 0
    //   }
    // },
    // {
    //   title: $t({ defaultMessage: 'Server Responses' }),
    //   dataIndex: 'serverResponses',
    //   key: 'serverResponses',
    //   sorter: true,
    //   render: () => {
    //     // TODO: API is not ready, this is mocked data for display
    //     return 0
    //   }
    // },
    // {
    //   title: $t({ defaultMessage: 'Types of mDNS Services' }),
    //   dataIndex: 'typesCount',
    //   key: 'typesCount',
    //   sorter: true,
    //   render: () => {
    //     // TODO: API is not ready, this is mocked data for display
    //     return 0
    //   }
    // }
  ]

  return (
    <Card title={
      $t(
        { defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount }
      )
    }>
      <Table<AP>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='serialNumber'
      />
    </Card>
  )
}

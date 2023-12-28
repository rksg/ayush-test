import { useIntl } from 'react-intl'

import { Card, Table, TableProps } from '@acx-ui/components'
import { useApListQuery }          from '@acx-ui/rc/services'
import { AP, useTableQuery }       from '@acx-ui/rc/utils'
import { TenantLink }              from '@acx-ui/react-router-dom'

interface MdnsProxyInstancesTableProps {
  apList: string[] | null
}

export function MdnsProxyInstancesTable (props: MdnsProxyInstancesTableProps) {
  const { $t } = useIntl()
  const { apList } = props

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

import { useIntl } from 'react-intl'

import { Card, Table, TableProps } from '@acx-ui/components'
import {
  useVenuesListQuery
} from '@acx-ui/rc/services'
import { useTableQuery, Venue } from '@acx-ui/rc/utils'
import { TenantLink }           from '@acx-ui/react-router-dom'

interface ClientIsolationInstancesTableProps {
  clientIsolationId: string
}

export function ClientIsolationInstancesTable (props: ClientIsolationInstancesTableProps) {
  const { $t } = useIntl()
  const { clientIsolationId } = props

  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      fields: ['id', 'name', 'city'],
      // TODO
      // eslint-disable-next-line max-len
      filters: { id: ['421d82b69e504c578d88f805736cd209', 'd6062edbdf57451facb33967c2160c72', '4ca20c8311024ac5956d366f15d96e0c'] }
    }
  })

  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      disable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/venues/${row.id}/venue-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'city',
      key: 'city',
      sorter: true
    }
  ]

  return (
    <Card title={
      $t(
        { defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount }
      )
    }>
      <Table<Venue>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Card>
  )
}

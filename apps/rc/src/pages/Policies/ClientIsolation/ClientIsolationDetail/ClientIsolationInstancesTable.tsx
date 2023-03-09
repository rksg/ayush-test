import { useIntl } from 'react-intl'

import { Card, Table, TableProps }         from '@acx-ui/components'
import { SimpleListTooltip }               from '@acx-ui/rc/components'
import {
  useGetVenueUsageByClientIsolationQuery
} from '@acx-ui/rc/services'
import { useTableQuery, VenueUsageByClientIsolation } from '@acx-ui/rc/utils'
import { TenantLink }                                 from '@acx-ui/react-router-dom'

export function ClientIsolationInstancesTable () {
  const { $t } = useIntl()

  const tableQuery = useTableQuery({
    useQuery: useGetVenueUsageByClientIsolationQuery,
    defaultPayload: {},
    sorter: {
      sortField: '',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<VenueUsageByClientIsolation>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueName',
      dataIndex: 'venueName',
      sorter: true,
      searchable: true,
      render: function (data, row) {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      key: 'networkCount',
      align: 'center',
      render: (data, row) => {
        return data
          ? <SimpleListTooltip items={row.networkNames} displayText={row.networkCount} />
          : 0
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
      <Table<VenueUsageByClientIsolation>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='venueId'
      />
    </Card>
  )
}

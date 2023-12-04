import { useIntl } from 'react-intl'

import { Card, Table, TableProps }         from '@acx-ui/components'
import { SimpleListTooltip }               from '@acx-ui/rc/components'
import {
  useGetVenueUsageByClientIsolationQuery
} from '@acx-ui/rc/services'
import { SEARCH, FILTER, useTableQuery, VenueUsageByClientIsolation } from '@acx-ui/rc/utils'
import { TenantLink }                                                 from '@acx-ui/react-router-dom'

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
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
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
      render: (_, row) => {
        return row.networkCount
          ? <SimpleListTooltip items={row.networkNames} displayText={row.networkCount} />
          : 0
      }
    }
  ]

  const handleSearch = (filters: FILTER, search: SEARCH) => {
    if (tableQuery.payload.searchVenueNameString === search.searchString) {
      return
    }
    tableQuery.setPayload({
      ...tableQuery.payload,
      searchVenueNameString: search.searchString
    })
  }

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
        onFilterChange={handleSearch}
        enableApiFilter={true}
        rowKey='venueId'
      />
    </Card>
  )
}

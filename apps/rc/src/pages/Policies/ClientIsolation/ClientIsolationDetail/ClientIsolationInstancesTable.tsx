import { ReactNode } from 'react'

import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Card, Table, TableProps }          from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                from '@acx-ui/rc/components'
import {
  useGetVenueUsageByClientIsolationQuery
} from '@acx-ui/rc/services'
import { SEARCH, FILTER, useTableQuery, VenueUsageByClientIsolation } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                      from '@acx-ui/react-router-dom'

export function ClientIsolationInstancesTable () {
  const { $t } = useIntl()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isClientIsolationEnabled = useIsSplitOn(Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE)
  const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: useGetVenueUsageByClientIsolationQuery,
    defaultPayload: {},
    sorter: {
      sortField: '',
      sortOrder: 'ASC'
    },
    enableRbac
  })

  const columns: TableProps<VenueUsageByClientIsolation>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
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
    },
    ...(isClientIsolationEnabled ? [{
      title: $t({ defaultMessage: 'Applied Wired APs' }),
      dataIndex: 'apCount',
      key: 'apCount',
      align: 'center' as AlignType,
      render: (_: ReactNode, row: VenueUsageByClientIsolation) => {
        return row.apCount
          ? <SimpleListTooltip items={row.apNames} displayText={row.apCount} />
          : 0
      }
    }] : [])
  ]

  const handleSearch = (filters: FILTER, search: SEARCH) => {
    if (tableQuery.payload.searchVenueNameString === search.searchString) {
      return
    }
    tableQuery.setPayload({
      ...tableQuery.payload,
      searchVenueNameString: search.searchString,
      id: params.policyId
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

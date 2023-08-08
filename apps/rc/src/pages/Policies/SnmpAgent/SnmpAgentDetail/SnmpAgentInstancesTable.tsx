import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader } from '@acx-ui/components'
import { useGetApUsageByApSnmpQuery }      from '@acx-ui/rc/services'
import { ApSnmpApUsage, useTableQuery }    from '@acx-ui/rc/utils'
import { TenantLink }                      from '@acx-ui/react-router-dom'

export default function SnmpAgentInstancesTable () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useGetApUsageByApSnmpQuery,
    defaultPayload: {
      fields: ['apId', 'apName', 'venueId', 'venueName'],
      page: 1,
      pageSize: 25,
      searchString: ''
    },
    sorter: {
      sortField: 'venueName',
      sortOrder: 'DESC'
    }
  })
  const columns: TableProps<ApSnmpApUsage>['columns'] = [
    {
      key: 'apName',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      searchable: true,
      sorter: true,
      render: function (_, row, __, highlightFn) {
        const { apName, apId } = row
        return (
          <TenantLink to={`/devices/wifi/${apId}/details/overview`}>
            {highlightFn(apName || '--')}
          </TenantLink>
        )
      }
    },
    {
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venueName',
      searchable: true,
      sorter: true,
      render: (_, row, __, highlightFn) => {
        const { venueName, venueId } = row
        return (
          <TenantLink to={`/venues/${venueId}/venue-details/overview`}>
            {highlightFn(venueName || '--')}
          </TenantLink>
        )
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount })}>
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='apId'
        />
      </Card>
    </Loader>
  )
}

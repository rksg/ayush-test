import { Card }    from 'antd'
import { useIntl } from 'react-intl'

//import { useTableQuery } from '@acx-ui/rc/utils'


export function IdentityProviderInstancesTable () {
  const { $t } = useIntl()
  /*
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
      key: 'networkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'networkName',
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
      defaultSortOrder: 'descend',
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
  */

  return (
    <Card title={$t({ defaultMessage: 'Instances ({count})' },
      { count: 0 } //tableQuery.data?.totalCount }
    )}>
      {/*
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='apId'
        />
        */}
    </Card>
  )
}
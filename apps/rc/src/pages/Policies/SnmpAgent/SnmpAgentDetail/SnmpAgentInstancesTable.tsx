import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import { useGetApUsageByApSnmpQuery }      from '@acx-ui/rc/services'
import { ApSnmpApUsage, useTableQuery }    from '@acx-ui/rc/utils'
import { TenantLink }                      from '@acx-ui/react-router-dom'
import { noDataDisplay }                   from '@acx-ui/utils'

export default function SnmpAgentInstancesTable () {
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useGetApUsageByApSnmpQuery,
    enableRbac: isUseRbacApi,
    defaultPayload: {
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
        return (!apName? noDataDisplay :
          <TenantLink to={`/devices/wifi/${apId}/details/overview`}>
            {highlightFn(apName)}
          </TenantLink>
        )
      }
    },
    {
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular> Name' }),
      dataIndex: 'venueName',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'descend',
      render: (_, row, __, highlightFn) => {
        const { venueName, venueId } = row
        return (!venueName? noDataDisplay :
          <TenantLink to={`/venues/${venueId}/venue-details/overview`}>
            {highlightFn(venueName)}
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

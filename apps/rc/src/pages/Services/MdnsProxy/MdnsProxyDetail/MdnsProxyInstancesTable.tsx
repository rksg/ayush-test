import { useIntl } from 'react-intl'

import { Card, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useApListQuery }          from '@acx-ui/rc/services'
import { AP }                      from '@acx-ui/rc/utils'
import { TenantLink }              from '@acx-ui/react-router-dom'
import { useTableQuery }           from '@acx-ui/utils'

interface MdnsProxyInstancesTableProps {
  apList: string[] | null
}

export function MdnsProxyInstancesTable (props: MdnsProxyInstancesTableProps) {
  const { $t } = useIntl()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const { apList } = props

  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      fields: ['name', 'model', 'apMac', 'venueName', 'venueId', 'clients', 'serialNumber'],
      filters: { serialNumber: apList ? apList : [''] }
    },
    enableRbac: isWifiRbacEnabled
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
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
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

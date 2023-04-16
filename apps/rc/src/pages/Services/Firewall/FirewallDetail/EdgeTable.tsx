import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { useGetEdgeListQuery }       from '@acx-ui/rc/services'
import { EdgeStatus, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                from '@acx-ui/react-router-dom'

interface EdgeTableProps {
  edgeIds: string[]
}

export const EdgeTable = (props: EdgeTableProps) => {

  const { $t } = useIntl()
  const defaultEdgePayload = {
    fields: [
      'id',
      'name',
      'venueId',
      'venueName'
    ],
    filters: { serialNumber: props.edgeIds }
  }
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeListQuery,
    defaultPayload: defaultEdgePayload,
    option: {
      skip: props.edgeIds.length === 0
    }
  })

  const columns: TableProps<EdgeStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/devices/edge/${row.serialNumber}/edge-details/overview`}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueName',
      dataIndex: 'venueName',
      sorter: true,
      render: (data, row) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {data}
        </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      key: 'health',
      dataIndex: 'health'
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey='serailNumber'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}
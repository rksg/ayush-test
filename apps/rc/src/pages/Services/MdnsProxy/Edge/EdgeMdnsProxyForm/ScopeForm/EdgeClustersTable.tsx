import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }        from '@acx-ui/components'
import { EdgeClusterStatusLabel }           from '@acx-ui/rc/components'
import { useGetEdgeClusterListQuery }       from '@acx-ui/rc/services'
import { EdgeClusterStatus, useTableQuery } from '@acx-ui/rc/utils'

interface EdgeClustersTableProps {
  venueId: string
  activated: string[] | undefined,
  onActivateChange: (value: boolean, clusterId: string, clusterName: string) => void
}
export const EdgeClustersTable = (props: EdgeClustersTableProps) => {
  const {
    venueId,
    activated,
    onActivateChange
  } = props

  const { $t } = useIntl()
  const tableQuery = useTableQuery<EdgeClusterStatus>({
    useQuery: useGetEdgeClusterListQuery,
    defaultPayload: {
      sortField: 'name',
      sortOrder: 'ASC',
      fields: [
        'name',
        'venueId',
        'clusterId',
        'clusterStatus',
        'edgeList',
        'highAvailabilityMode',
        'firmwareVersion'
      ],
      filters: { venueId: [venueId] }
    },
    option: {
      skip: !Boolean(venueId)
    }
  })

  const columns: TableProps<EdgeClusterStatus>['columns'] = [{
    title: $t({ defaultMessage: 'Cluster' }),
    key: 'name',
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    fixed: 'left',
    sorter: true
  }, {
    title: $t({ defaultMessage: 'Status' }),
    key: 'clusterStatus',
    dataIndex: 'clusterStatus',
    render: (_, row) => {
      return <EdgeClusterStatusLabel edgeList={row.edgeList} clusterStatus={row.clusterStatus} />
    }
  }, {
    title: $t({ defaultMessage: 'Activate' }),
    key: 'action',
    dataIndex: 'action',
    align: 'center' as const,
    width: 80,
    render: (_, row: EdgeClusterStatus) => {
      return <Switch
        checked={Boolean(activated?.find(i => i === row.clusterId))}
        onChange={(checked) => onActivateChange(checked, row.clusterId!, row.name!)}
      />
    }
  }]

  return (
    <Loader states={[ tableQuery ]}>
      <Table
        rowKey='clusterId'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}
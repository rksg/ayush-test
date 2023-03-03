import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                      from '@acx-ui/components'
import { useAaaNetworkInstancesQuery }                          from '@acx-ui/rc/services'
import { Network, NetworkType, NetworkTypeEnum, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                           from '@acx-ui/react-router-dom'

export default function AAAInstancesTable (){

  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useAaaNetworkInstancesQuery,
    defaultPayload: {
      fields: ['name', 'id', 'captiveType', 'nwSubType'],
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })
  const columns: TableProps<Network>['columns'] = [
    {
      key: 'NetworkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      render: function (_data, row) {
        return (
          <TenantLink
            to={`/networks/${row.id}/network-details/aps`}>
            {row.name}</TenantLink>
        )
      }
    },
    {
      key: 'Type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      render: (data: unknown, row) => <NetworkType
        networkType={data as NetworkTypeEnum}
        row={row}
      />
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
          rowKey='id'
        />
      </Card>
    </Loader>
  )
}

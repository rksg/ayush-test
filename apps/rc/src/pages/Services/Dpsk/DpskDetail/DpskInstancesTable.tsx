import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Card }                      from '@acx-ui/components'
import { useNetworkListQuery }                                  from '@acx-ui/rc/services'
import { Network, NetworkType, NetworkTypeEnum, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                           from '@acx-ui/react-router-dom'

export default function DpskInstancesTable (props: { networkIds?: string[] }) {
  const { $t } = useIntl()
  const { networkIds } = props
  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload: {
      fields: ['check-all', 'name', 'description', 'nwSubType', 'venues', 'id'],
      filters: { id: networkIds && networkIds?.length > 0 ? networkIds : [''] }
    }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { id: networkIds && networkIds.length > 0 ? networkIds : [''] }
    })
  }, [networkIds, tableQuery.data?.data])

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return <TenantLink
          to={`/networks/wireless/${row.id}/network-details/overview`}>{data}</TenantLink>
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (data: unknown, row) => {
        return <NetworkType networkType={data as NetworkTypeEnum} row={row} />
      }
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      sorter: true,
      render: function (count, row) {
        // eslint-disable-next-line max-len
        return <TenantLink to={`/networks/wireless/${row.id}/network-details/venues`} children={count ? count : 0} />
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Card.Title>
        {$t({
          defaultMessage: 'Instances ({instanceCount})'
        },
        {
          instanceCount: tableQuery.data?.totalCount
        })}
      </Card.Title>
      <Table<Network>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Loader>
  )
}

import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { useWifiNetworkListQuery }   from '@acx-ui/rc/services'
import {
  NetworkType,
  NetworkTypeEnum,
  useTableQuery,
  WifiNetwork
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

interface NetworkTableProps {
  networkIds: string[] | undefined;
}

export const NetworksTable = (props: NetworkTableProps) => {
  const { networkIds } = props
  const { $t } = useIntl()

  const tableQuery = useTableQuery({
    useQuery: useWifiNetworkListQuery,
    defaultPayload: {
      fields: ['id', 'name', 'nwSubType'],
      filters: { id: networkIds }
    },
    option: {
      skip: !networkIds?.length
    }
  })

  useEffect(() => {
    if (networkIds?.length) {
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: { id: networkIds }
      })
    }
  }, [networkIds])

  const columns: TableProps<WifiNetwork>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => (
        <TenantLink
          to={`/networks/wireless/${row.id}/network-details/overview`}
        >
          {row.name}
        </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Network Type' }),
      key: 'nwSubType',
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => (
        <NetworkType networkType={row.nwSubType as NetworkTypeEnum} row={row} />
      )
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}

import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                            from '@acx-ui/components'
import { useNetworkListQuery }                                  from '@acx-ui/rc/services'
import { Network, NetworkType, NetworkTypeEnum, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                           from '@acx-ui/react-router-dom'

interface NetworkTableProps {
  networkIds: string[]
}

export const NetworkTable = (props: NetworkTableProps) => {
  const { networkIds } = props
  const { $t } = useIntl()
  const [isPayloadReady, setIsPayloadReady] = useState(false)

  const defaultPayload = {
    fields: [
      'id',
      'name',
      'nwSubType'
    ],
    filters: { id: networkIds }
  }
  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload: defaultPayload,
    option: {
      skip: !isPayloadReady || networkIds.length === 0
    }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { id: networkIds }
    })
  }, [networkIds])

  useEffect(() => {
    if(tableQuery?.payload?.filters?.id.length > 0) {
      setIsPayloadReady(true)
    }
  }, [tableQuery.payload.filters])

  const columns: TableProps<Network>['columns'] = [{
    title: $t({ defaultMessage: 'Network' }),
    key: 'name',
    dataIndex: 'name',
    sorter: true,
    defaultSortOrder: 'ascend',
    render: (_, row) => (
      <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
        {row.name}
      </TenantLink>
    )
  }, {
    title: $t({ defaultMessage: 'Network Type' }),
    key: 'nwSubType',
    dataIndex: 'nwSubType',
    sorter: true,
    render: (_, row) => (
      <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    )
  }]

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

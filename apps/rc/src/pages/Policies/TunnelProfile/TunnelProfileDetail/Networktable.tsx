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

  const { $t } = useIntl()
  const [isPayloadReady,setIsPayloadReady] = useState(false)
  const defaultNetworkPayload = {
    fields: [
      'id',
      'name',
      'nwSubType',
      'venues'
    ],
    filters: { id: props.networkIds }
  }
  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload: defaultNetworkPayload,
    option: {
      skip: !isPayloadReady || props.networkIds.length === 0
    }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { id: props.networkIds }
    })
  }, [props.networkIds])

  useEffect(() => {
    if(tableQuery?.payload?.filters?.id.length > 0) {
      setIsPayloadReady(true)
    }
  }, [tableQuery.payload.filters])

  const columns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        return (
          <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'nwSubType',
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => (
        <NetworkType
          networkType={row.nwSubType as NetworkTypeEnum}
          row={row}
        />
      )
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      key: 'venues',
      dataIndex: 'venues',
      sorter: true,
      render: (_, row) => row.venues.count
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}

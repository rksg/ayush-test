import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                    from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useNetworkListQuery, useWifiNetworkListQuery } from '@acx-ui/rc/services'
import { Network, NetworkType, NetworkTypeEnum }        from '@acx-ui/rc/utils'
import { TenantLink }                                   from '@acx-ui/react-router-dom'
import { useTableQuery }                                from '@acx-ui/utils'

interface NetworkTableProps {
  networkIds: string[]
}

export const NetworkTable = (props: NetworkTableProps) => {

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { $t } = useIntl()
  const [isPayloadReady,setIsPayloadReady] = useState(false)
  const defaultNetworkPayload = {
    fields: [
      'id',
      'name',
      'nwSubType',
      'venues',
      'venueApGroups'
    ],
    filters: { id: props.networkIds }
  }
  const tableQuery = useTableQuery({
    useQuery: isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery,
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
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
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

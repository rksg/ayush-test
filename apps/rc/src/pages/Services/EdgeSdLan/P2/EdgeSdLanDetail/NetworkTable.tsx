import { useEffect } from 'react'

import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Loader, Table, TableProps }                    from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { CheckMark }                                    from '@acx-ui/icons'
import { useNetworkListQuery, useWifiNetworkListQuery } from '@acx-ui/rc/services'
import {
  Network,
  NetworkType,
  NetworkTypeEnum,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

interface NetworkTableProps {
  networkIds: string[];
  guestNetworkIds?: string[];
}

export const NetworkTable = (props: NetworkTableProps) => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { networkIds, guestNetworkIds } = props
  const { $t } = useIntl()

  const defaultPayload = {
    fields: ['id', 'name', 'nwSubType'],
    filters: { id: networkIds }
  }
  const tableQuery = useTableQuery({
    useQuery: isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery,
    defaultPayload: defaultPayload,
    option: {
      skip: networkIds.length === 0
    }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { id: networkIds }
    })
  }, [networkIds])

  const columns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network' }),
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
    },
    ...(guestNetworkIds ? [{
      title: $t({ defaultMessage: 'Forward Guest Traffic to DMZ' }),
      key: 'guestTraffic',
      dataIndex: 'guestTraffic',
      sorter: true,
      align: 'center' as AlignType,
      render: (_: unknown, row: Network) => (
        guestNetworkIds.findIndex((item) => item === row.id) === -1
          ? ''
          : <CheckMark />
      )
    }] : [])
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

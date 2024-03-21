import React, { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                       from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { useGetNetworkTunnelInfo, useSdLanScopedNetworks } from '@acx-ui/rc/components'
import { useApNetworkListQuery, useApViewModelQuery }      from '@acx-ui/rc/services'
import {
  Network,
  NetworkType,
  NetworkTypeEnum,
  useTableQuery,
  useApContext
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


const defaultPayload = {
  searchString: '',
  fields: [
    'name', 'description', 'nwSubType', 'vlan', 'cog', 'ssid',
    'vlanPool', 'tunnelWlanEnable', 'captiveType', 'venues', 'id'
  ]
}

export function ApNetworksTab () {
  const { $t } = useIntl()
  const apiParams = useApContext() as Record<string, string>
  const settingsId = 'ap-networks-table'
  const tableQuery = useTableQuery({
    useQuery: useApNetworkListQuery,
    defaultPayload,
    apiParams,
    pagination: { settingsId }
  })
  const isEdgeSdLanHaReady = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)
  const apViewModelPayload = {
    entityType: 'aps',
    fields: ['name', 'serialNumber', 'venueId'],
    filters: { serialNumber: [apiParams.serialNumber] }
  }
  const apViewModelQuery = useApViewModelQuery({ apiParams, payload: apViewModelPayload },
    { skip: !isEdgeSdLanHaReady })

  const sdLanScopedNetworks = useSdLanScopedNetworks(apViewModelQuery.data?.venueId
    , tableQuery.data?.data.map(item => item.id))
  const getNetworkTunnelInfo = useGetNetworkTunnelInfo()

  const columns: TableProps<Network>['columns'] = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
          {row.name}
        </TenantLink>
      }
    }, {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    }, {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    }, {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      render: function (_, row) {
        return (row.vlanPool) ?
          $t({ defaultMessage: 'VLAN Pool: {poolName}' }, { poolName: row.vlanPool?.name ?? '' }) :
          $t({ defaultMessage: 'VLAN-{id}' }, { id: row.vlan })
      }
    },
    ...(isEdgeSdLanHaReady ? [{
      key: 'tunneled',
      title: $t({ defaultMessage: 'Tunnel' }),
      dataIndex: 'tunneled',
      render: function (_: ReactNode, row: Network) {
        const destinationsInfo = sdLanScopedNetworks?.sdLans?.filter(sdlan =>
          sdlan.networkIds.includes(row.id))
        return getNetworkTunnelInfo(destinationsInfo)
      }
    }]: [])
    // { // TODO: Waiting for HEALTH feature support
    //   key: 'health',
    //   title: $t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health',
    //   sorter: true
    // },
    // { // TODO: Waiting for TAG feature support
    //   key: 'tags',
    //   title: $t({ defaultMessage: 'Tags' }),
    //   dataIndex: 'tags',
    //   sorter: true
    // }
    ]
  }, [$t, sdLanScopedNetworks])

  return (
    <Loader states={[tableQuery]}>
      <Table
        settingsId={settingsId}
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Loader>
  )
}

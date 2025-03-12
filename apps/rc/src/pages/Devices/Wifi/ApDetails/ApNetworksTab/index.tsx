import React, { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { useGetNetworkTunnelInfo, useIsEdgeFeatureReady, useSdLanScopedVenueNetworks } from '@acx-ui/rc/components'
import { useApNetworkListQuery, useGetRbacApNetworkListQuery }                         from '@acx-ui/rc/services'
import {
  Network,
  NetworkType,
  NetworkTypeEnum,
  useTableQuery,
  useApContext,
  EdgeSdLanViewDataP2
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
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeMvSdLanReady = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const showTunnelColumn = (isEdgeSdLanHaReady && !isEdgeMvSdLanReady)

  const apiParams = useApContext() as Record<string, string>
  const settingsId = 'ap-networks-table'
  const tableQuery = useTableQuery({
    useQuery: isWifiRbacEnabled? useGetRbacApNetworkListQuery : useApNetworkListQuery,
    defaultPayload,
    apiParams,
    pagination: { settingsId }
  })

  // tunnel
  const venueId = showTunnelColumn? apiParams?.venueId : undefined
  const networkIds = tableQuery.data?.data?.map(item => item.id)
  const sdLanScopedNetworks = useSdLanScopedVenueNetworks(venueId, networkIds)
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
    ...(showTunnelColumn ? [{
      key: 'tunneled',
      title: $t({ defaultMessage: 'Tunnel' }),
      dataIndex: 'tunneled',
      render: function (_: ReactNode, row: Network) {
        const destinationsInfo = (sdLanScopedNetworks?.sdLans as EdgeSdLanViewDataP2[])
          ?.filter(sdlan => sdlan.networkIds.includes(row.id))
        return getNetworkTunnelInfo(row.id, destinationsInfo?.[0])
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
  }, [$t, sdLanScopedNetworks, showTunnelColumn])

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

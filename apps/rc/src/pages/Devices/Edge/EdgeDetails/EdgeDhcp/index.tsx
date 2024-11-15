import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }                                                         from '@acx-ui/components'
import { Features }                                                     from '@acx-ui/feature-toggle'
import { EdgeDhcpLeaseTable, EdgeDhcpPoolTable, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  useGetDhcpHostStatsQuery,
  useGetDhcpPoolStatsQuery,
  useGetDhcpStatsQuery
} from '@acx-ui/rc/services'
import {
  DhcpPoolStats,
  EdgeDhcpHostStatus,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useTenantLink }  from '@acx-ui/react-router-dom'
import { RequestPayload } from '@acx-ui/types'

import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'


export const EdgeDhcp = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, serialNumber } = useParams()
  const { currentEdgeStatus } = useContext(EdgeDetailsDataContext)
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/details/dhcp`)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const { isLeaseTimeInfinite } = useGetDhcpStatsQuery(
    {
      payload: {
        fields: [
          'leaseTime'
        ],
        filters: { edgeClusterIds: [currentEdgeStatus?.clusterId] }
      }
    },
    {
      skip: !isEdgeHaReady || !isEdgeDhcpHaReady,
      selectFromResult: ({ data }) => ({
        isLeaseTimeInfinite: data?.data[0]?.leaseTime === 'Infinite'
      })
    }
  )
  const getDhcpPoolStatsPayload = {
    fields: [
      'id',
      'dhcpId',
      'poolId',
      'poolName',
      'subnetMask',
      'poolRange',
      'gateway',
      'edgeId',
      'utilization'
    ],
    filters: { edgeClusterId: [currentEdgeStatus?.clusterId] }
  }
  const settingsId = 'edge-dhcp-pools-table'
  const poolTableQuery = useTableQuery<DhcpPoolStats, RequestPayload<unknown>, unknown>({
    useQuery: useGetDhcpPoolStatsQuery,
    defaultPayload: getDhcpPoolStatsPayload,
    sorter: {
      sortField: 'poolName',
      sortOrder: 'ASC'
    },
    pagination: { settingsId }
  })

  const getDhcpHostStatsPayload = {
    filters: {
      edgeClusterId: [currentEdgeStatus?.clusterId],
      hostStatus: [EdgeDhcpHostStatus.ONLINE]
    },
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const { data: dhcpHostStats } = useGetDhcpHostStatsQuery({
    payload: getDhcpHostStatsPayload
  },{
    skip: !isEdgeHaReady || !isEdgeDhcpHaReady
  })

  const tabs = {
    pools: {
      title: $t({ defaultMessage: 'Pools' }),
      content: <EdgeDhcpPoolTable tableQuery={poolTableQuery} settingsId={settingsId} />
    },
    leases: {
      title: $t(
        { defaultMessage: 'Leases ( {count} online )' },
        { count: dhcpHostStats?.totalCount || 0 }
      ),
      content: <EdgeDhcpLeaseTable
        clusterId={currentEdgeStatus?.clusterId}
        isInfinite={isLeaseTimeInfinite}
      />
    }
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='pools'
      activeKey={activeSubTab}
      type='card'
    >
      {Object.keys(tabs)
        .map((key) =>
          <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
            {tabs[key as keyof typeof tabs].content}
          </Tabs.TabPane>)}
    </Tabs>
  )
}

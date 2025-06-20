/* eslint-disable max-len */
import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                                             from '@acx-ui/components'
import { Features }                                         from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                            from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery, useGetEdgeServiceListQuery } from '@acx-ui/rc/services'
import { NodeClusterRoleEnum }                              from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }            from '@acx-ui/react-router-dom'
import { EdgeScopes }                                       from '@acx-ui/types'
import { hasPermission }                                    from '@acx-ui/user'

import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

const EdgeDetailsTabs = (props: { isOperational: boolean }) => {
  const { $t } = useIntl()
  const params = useParams()
  const { currentEdgeStatus: currentEdge, currentCluster } = useContext(EdgeDetailsDataContext)
  const { serialNumber } = params
  const basePath = useTenantLink(`/devices/edge/${params.serialNumber}/details`)
  const navigate = useNavigate()
  const isEdgePingTraceRouteReady = useIsEdgeFeatureReady(Features.EDGES_PING_TRACEROUTE_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)

  const { hasDhcpService = false } = useGetDhcpStatsQuery({
    payload: { fields: ['id'], filters: { edgeClusterIds: [currentEdge?.clusterId] } }
  }, {
    skip: !isEdgeDhcpHaReady || !currentEdge?.clusterId,
    selectFromResult: ({ data }) => ({
      hasDhcpService: (data?.totalCount ?? 0) > 0
    })
  })

  const onTabChange = (tab: string) => {
    if(tab === 'dhcp') tab = tab + '/pools'
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  const { servicesCount = 0 } = useGetEdgeServiceListQuery({
    payload: {
      fields: ['serviceId'],
      filters: { edgeId: [serialNumber] }
    }
  }, {
    selectFromResult: ({ data }) => ({
      servicesCount: data?.totalCount
    })
  })

  const showTroubleshooting = isEdgePingTraceRouteReady && props.isOperational && hasPermission({ scopes: [EdgeScopes.UPDATE] })
  const showDhcp = isEdgeDhcpHaReady && hasDhcpService &&
    ((currentCluster?.smartEdges.length ?? 0) > 1 ? currentEdge?.haStatus === NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE : true)

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      {
        showTroubleshooting &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })}
          key='troubleshooting' />
      }
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount })}
        key='services'
      />
      {
        showDhcp &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'DHCP' })} key='dhcp' />
      }
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default EdgeDetailsTabs

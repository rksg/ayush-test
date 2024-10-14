/* eslint-disable max-len */
import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                                             from '@acx-ui/components'
import { Features }                                         from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady, useIsEdgeReady }            from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery, useGetEdgeServiceListQuery } from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink }            from '@acx-ui/react-router-dom'
import { EdgeScopes }                                       from '@acx-ui/types'
import { hasPermission }                                    from '@acx-ui/user'

import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

const EdgeDetailsTabs = (props: { isOperational: boolean }) => {
  const { $t } = useIntl()
  const params = useParams()
  const { currentEdgeStatus: currentEdge } = useContext(EdgeDetailsDataContext)
  const { serialNumber } = params
  const basePath = useTenantLink(`/devices/edge/${params.serialNumber}/details`)
  const navigate = useNavigate()
  const isEdgeReady = useIsEdgeReady()
  const isEdgePingTraceRouteReady = useIsEdgeFeatureReady(Features.EDGES_PING_TRACEROUTE_TOGGLE)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
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
    skip: !isEdgeReady,
    selectFromResult: ({ data }) => ({
      servicesCount: data?.totalCount
    })
  })

  const showTroubleshooting = isEdgePingTraceRouteReady && props.isOperational && hasPermission({ scopes: [EdgeScopes.UPDATE] })

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      {
        showTroubleshooting &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })}
          key='troubleshooting' />}
      {
        isEdgeReady &&
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount })}
          key='services'
        />
      }
      {
        isEdgeHaReady && isEdgeDhcpHaReady && hasDhcpService &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'DHCP' })} key='dhcp' />
      }
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default EdgeDetailsTabs

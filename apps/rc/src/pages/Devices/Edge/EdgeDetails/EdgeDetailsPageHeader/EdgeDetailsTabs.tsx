/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useGetEdgeServiceListQuery }            from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const EdgeDetailsTabs = (props: { isOperational: boolean }) => {
  const { $t } = useIntl()
  const params = useParams()
  const { serialNumber } = params
  const basePath = useTenantLink(`/devices/edge/${params.serialNumber}/details`)
  const navigate = useNavigate()
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const isEdgePingTraceRouteReady = useIsSplitOn(Features.EDGES_PING_TRACEROUTE_TOGGLE)
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

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      {
        isEdgePingTraceRouteReady && props.isOperational &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })}
          key='troubleshooting' />}
      {
        isEdgeReady &&
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount })}
          key='services'
        />
      }
      <Tabs.TabPane tab={$t({ defaultMessage: 'DHCP' })} key='dhcp' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default EdgeDetailsTabs

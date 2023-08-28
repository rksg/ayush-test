import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Tabs }                                     from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useGetEdgeListQuery }                      from '@acx-ui/rc/services'
import { EdgeStatus, PolicyType, ServiceType }      from '@acx-ui/rc/utils'


import ClientIsolationAllowList from './ClientIsolationAllowList'
import DHCPInstance             from './DHCPInstance'
import EdgeDhcpTab              from './DHCPInstance/Edge'
import EdgeFirewall             from './Firewall'
import MdnsProxyInstances       from './MdnsProxyInstances'
import { NetworkSegmentation }  from './NetworkSegmentation'
import { VenueRogueAps }        from './VenueRogueAps'

export function VenueServicesTab () {
  const { venueId } = useParams()
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const { $t } = useIntl()

  // get edge by venueId, use 'firewallId' in edge data
  const { edgeData, isEdgeLoading } = useGetEdgeListQuery(
    { payload: {
      fields: [
        'name',
        'serialNumber',
        'venueId',
        'firewallId'
      ],
      filters: { venueId: [venueId] }
    } },
    {
      skip: !!!venueId || !isEdgeEnabled,
      selectFromResult: ({ data, isLoading }) => ({
        edgeData: data?.data[0],
        isEdgeLoading: isLoading
      })
    }
  )

  const isAppliedFirewall = !_.isEmpty(edgeData?.firewallId)

  return (
    <Tabs type='second' defaultActiveKey={ServiceType.DHCP}>
      <Tabs.TabPane key={ServiceType.DHCP}
        tab={$t({ defaultMessage: 'DHCP' })}>
        <Tabs type='third'>
          <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })}
            key={'wifi'}>
            <DHCPInstance/>
          </Tabs.TabPane>
          {
            isEdgeEnabled &&
              <Tabs.TabPane tab={$t({ defaultMessage: 'SmartEdge' })}
                key={'smartEdge'}>
                <EdgeDhcpTab/>
              </Tabs.TabPane>
          }
        </Tabs>
      </Tabs.TabPane>
      {
        (isEdgeEnabled && isEdgeReady) &&
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Network Segmentation' })}
            key={ServiceType.NETWORK_SEGMENTATION}
          >
            <NetworkSegmentation />
          </Tabs.TabPane>
      }
      <Tabs.TabPane tab={$t({ defaultMessage: 'mDNS Proxy' })} key={ServiceType.MDNS_PROXY}>
        <MdnsProxyInstances />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Client Isolation Allowlist' })}
        key={PolicyType.CLIENT_ISOLATION}
      >
        <ClientIsolationAllowList />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Rogue APs' })}
        key={PolicyType.ROGUE_AP_DETECTION}
      >
        <VenueRogueAps />
      </Tabs.TabPane>
      {
        isEdgeEnabled && isAppliedFirewall && !isEdgeLoading && isEdgeReady &&
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Firewall' })}
            key={ServiceType.EDGE_FIREWALL}
          >
            <EdgeFirewall edgeData={edgeData as EdgeStatus}/>
          </Tabs.TabPane>
      }
    </Tabs>
  )
}

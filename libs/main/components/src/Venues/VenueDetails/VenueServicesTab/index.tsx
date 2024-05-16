import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Tabs }                                                                                                              from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                                                                    from '@acx-ui/feature-toggle'
import { useGetDhcpStatsQuery, useGetEdgeListQuery, useGetEdgeSdLanP2ViewDataListQuery, useGetNetworkSegmentationViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeStatus, PolicyType, ServiceType, useConfigTemplate }                                                                    from '@acx-ui/rc/utils'


import ClientIsolationAllowList from './ClientIsolationAllowList'
import DHCPInstance             from './DHCPInstance'
import EdgeDhcpTab              from './DHCPInstance/Edge'
import EdgeFirewall             from './Firewall'
import MdnsProxyInstances       from './MdnsProxyInstances'
import { NetworkSegmentation }  from './NetworkSegmentation'
import EdgeSdLan                from './SdLan'
import { VenueRogueAps }        from './VenueRogueAps'

export function VenueServicesTab () {
  const { venueId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES) && !isTemplate
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE) && !isTemplate
  const isEdgeSdLanReady = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE) && !isTemplate
  const isEdgeSdLanHaEnabled = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE) && !isTemplate
  const isEdgeHaReady = useIsSplitOn(Features.EDGE_HA_TOGGLE) && !isTemplate
  const isEdgeDhcpHaReady = useIsSplitOn(Features.EDGE_DHCP_HA_TOGGLE) && !isTemplate
  const isEdgeFirewallHaReady = useIsSplitOn(Features.EDGE_FIREWALL_HA_TOGGLE) && !isTemplate
  const isEdgePinReady = useIsSplitOn(Features.EDGE_PIN_HA_TOGGLE) && !isTemplate

  const { $t } = useIntl()

  // get edge by venueId, use 'firewallId' in edge data
  const edgeListFields = ['name', 'serialNumber', 'venueId', 'clusterId']
  const { edgeData, isEdgeLoading } = useGetEdgeListQuery(
    { payload: {
      // Before Edge GA, no need to query firewallId
      fields: (isEdgeHaReady && isEdgeFirewallHaReady)
        ? edgeListFields.concat(['firewallId']) : edgeListFields,
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
  const { hasEdgeDhcp, isEdgeDhcpLoading } = useGetDhcpStatsQuery(
    {
      payload: {
        fields: [
          'id'
        ],
        filters: { edgeClusterIds: [edgeData?.clusterId] }
      }
    },
    {
      // Before Edge GA, need to hide the service not support HA
      // skip: !!!edgeData?.serialNumber || !isEdgeEnabled,
      skip: !Boolean(edgeData?.clusterId) || !isEdgeEnabled || !isEdgeHaReady || !isEdgeDhcpHaReady,
      selectFromResult: ({ data, isLoading }) => ({
        hasEdgeDhcp: Boolean(data?.data?.[0]?.id),
        isEdgeDhcpLoading: isLoading
      })
    })
  const {
    hasNsg, isGetNsgLoading
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { venueInfoIds: [venueId] }
    }
  }, {
    skip: !!!venueId || !isEdgeEnabled || !isEdgePinReady,
    selectFromResult: ({ data, isLoading }) => {
      return {
        hasNsg: data?.data[0]?.id,
        isGetNsgLoading: isLoading
      }
    }
  })

  const { edgeSdLanData } = useGetEdgeSdLanP2ViewDataListQuery(
    { payload: {
      fields: [
        'id',
        'name',
        'venueId',
        'venueName',
        'tunnelProfileId',
        'tunnelProfileName',
        'guestTunnelProfileId',
        'guestTunnelProfileName',
        'edgeClusterId',
        'edgeClusterName',
        'guestEdgeClusterId',
        'guestEdgeClusterName',
        'isGuestTunnelEnabled',
        'networkIds',
        'guestNetworkIds',
        'networkInfos'
      ],
      filters: { venueId: [venueId] }
    } }, {
      skip: !isEdgeEnabled || !(isEdgeSdLanReady || isEdgeSdLanHaEnabled),
      selectFromResult: ({ data }) => {
        return { edgeSdLanData: data?.data?.[0] }
      }
    })

  // Before Edge GA, need to hide the service not support HA
  const isAppliedFirewall = (isEdgeHaReady && isEdgeFirewallHaReady)
    ? !_.isEmpty(edgeData?.firewallId) : false

  return (
    <Loader states={[{ isLoading: isEdgeLoading || isEdgeDhcpLoading || isGetNsgLoading }]}>
      <Tabs type='card' defaultActiveKey={ServiceType.DHCP}>
        <Tabs.TabPane key={ServiceType.DHCP}
          tab={$t({ defaultMessage: 'DHCP' })}>
          <Tabs type='third'>
            <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })}
              key={'wifi'}>
              <DHCPInstance/>
            </Tabs.TabPane>
            {
              isEdgeEnabled && isEdgeHaReady && isEdgeDhcpHaReady &&
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'SmartEdge' })}
              key={'smartEdge'}
              disabled={!hasEdgeDhcp}
            >
              <EdgeDhcpTab/>
            </Tabs.TabPane>
            }
          </Tabs>
        </Tabs.TabPane>
        {
          isEdgeEnabled && isEdgeReady && hasNsg && isEdgePinReady &&
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Personal Identity Network' })}
            key={ServiceType.NETWORK_SEGMENTATION}
          >
            <NetworkSegmentation />
          </Tabs.TabPane>
        }
        {
          !isTemplate && <>
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
          </>
        }
        {
          isEdgeEnabled && isEdgeHaReady && isEdgeFirewallHaReady && isAppliedFirewall &&
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Firewall' })}
            key={ServiceType.EDGE_FIREWALL}
          >
            <EdgeFirewall edgeData={edgeData as EdgeStatus}/>
          </Tabs.TabPane>
        }
        {
          edgeSdLanData && isEdgeEnabled && isEdgeReady &&
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'SD-LAN' })}
            key={ServiceType.EDGE_SD_LAN}
          >
            <EdgeSdLan data={edgeSdLanData} />
          </Tabs.TabPane>
        }
      </Tabs>
    </Loader>
  )
}

import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Tabs }                                                                                                  from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled }                                                                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady, useIsEdgeReady }                                                                         from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery, useGetEdgeListQuery, useGetEdgePinViewDataListQuery, useGetEdgeSdLanP2ViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeStatus, PolicyType, ServiceType, useConfigTemplate }                                                        from '@acx-ui/rc/utils'


import ClientIsolationAllowList from './ClientIsolationAllowList'
import DHCPInstance             from './DHCPInstance'
import EdgeDhcpTab              from './DHCPInstance/Edge'
import EdgeFirewall             from './Firewall'
import MdnsProxyInstances       from './MdnsProxyInstances'
import { EdgeMdnsTab }          from './MdnsProxyInstances/Edge'
import { EdgePin }              from './Pin'
import EdgeSdLan                from './SdLan'
import { VenueRogueAps }        from './VenueRogueAps'
import { getUserProfile, isFoundationTier } from '@acx-ui/user'

export function VenueServicesTab () {
  const { venueId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const { accountTier } = getUserProfile()
  const isFoundation = isFoundationTier(accountTier)
  const isEdgeEnabled = useIsEdgeReady() && !isTemplate
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE) && !isTemplate
  const isEdgeSdLanHaEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE) && !isTemplate
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE) && !isTemplate
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE) && !isTemplate
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE) && !isTemplate
  // eslint-disable-next-line max-len
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE) && !isTemplate
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE) && !isTemplate
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)
  const isEdgeMdnsBetaFeature = useIsBetaEnabled(TierFeatures.EDGE_MDNS_PROXY)

  const { $t } = useIntl()

  // get edge by venueId, use 'firewallId' in edge data
  const edgeListFields = ['name', 'serialNumber', 'venueId', 'clusterId']
  const { edgeData, isEdgeLoading, edgeClusterIds = [] } = useGetEdgeListQuery(
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
        isEdgeLoading: isLoading,
        // eslint-disable-next-line max-len
        edgeClusterIds: data?.data.map(item => item.clusterId ?? '').filter((v,i,a)=>a.indexOf(v)===i)
      })
    }
  )
  const { hasEdgeDhcp, isEdgeDhcpLoading } = useGetDhcpStatsQuery(
    {
      payload: {
        fields: [
          'id'
        ],
        filters: { edgeClusterIds }
      }
    },
    {
      // Before Edge GA, need to hide the service not support HA
      // skip: !!!edgeData?.serialNumber || !isEdgeEnabled,
      skip: edgeClusterIds.length === 0 || !isEdgeHaReady || !isEdgeDhcpHaReady,
      selectFromResult: ({ data, isLoading }) => ({
        hasEdgeDhcp: Boolean(data?.data?.[0]?.id),
        isEdgeDhcpLoading: isLoading
      })
    })
  const {
    hasPin, isGetPinLoading
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id'],
      filters: { venueId: [venueId] }
    }
  }, {
    skip: !!!venueId || !isEdgePinReady,
    selectFromResult: ({ data, isLoading }) => {
      return {
        hasPin: data?.data[0]?.id,
        isGetPinLoading: isLoading
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
        'edgeAlarmSummary',
        ...(isEdgeSdLanMvEnabled
          ? ['tunneledWlans', 'tunneledGuestWlans']
          : ['networkIds', 'guestNetworkIds', 'networkInfos'])
      ],
      filters: { [isEdgeSdLanMvEnabled ? 'tunneledWlans.venueId' : 'venueId']: [venueId] }
    } }, {
      skip: !(isEdgeSdLanReady || isEdgeSdLanHaEnabled || isEdgeSdLanMvEnabled),
      selectFromResult: ({ data }) => {
        return { edgeSdLanData: data?.data?.[0] }
      }
    })

  // Before Edge GA, need to hide the service not support HA
  const isAppliedFirewall = (isEdgeHaReady && isEdgeFirewallHaReady)
    ? !_.isEmpty(edgeData?.firewallId) : false

  return (
    <Loader states={[{ isLoading: isEdgeLoading || isEdgeDhcpLoading || isGetPinLoading }]}>
      <Tabs type='card' defaultActiveKey={ServiceType.DHCP}>
        <Tabs.TabPane key={ServiceType.DHCP}
          tab={$t({ defaultMessage: 'DHCP' })}>
          <Tabs type='third'>
            <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })}
              key={'wifi'}>
              <DHCPInstance/>
            </Tabs.TabPane>
            {
              isEdgeHaReady && isEdgeDhcpHaReady &&
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'RUCKUS Edge' })}
              key={'smartEdge'}
              disabled={!hasEdgeDhcp}
            >
              <EdgeDhcpTab/>
            </Tabs.TabPane>
            }
          </Tabs>
        </Tabs.TabPane>
        {
          hasPin && isEdgePinReady &&
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Personal Identity Network' })}
            key={ServiceType.PIN}
          >
            <EdgePin />
          </Tabs.TabPane>
        }
        {
          !isTemplate && <>
            <Tabs.TabPane key={ServiceType.MDNS_PROXY}
              tab={$t({ defaultMessage: 'mDNS Proxy' })}>
              {isEdgeMdnsReady
                ? <Tabs type='third'>
                  <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })}
                    key={'wifi'}>
                    <MdnsProxyInstances />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={$t({ defaultMessage: 'RUCKUS Edge' })}
                    key={'smartEdge'}
                    isBetaFeature={isEdgeMdnsBetaFeature}
                  >
                    <EdgeMdnsTab/>
                  </Tabs.TabPane>
                </Tabs>
                : <MdnsProxyInstances />
              }
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'Client Isolation Allowlist' })}
              key={PolicyType.CLIENT_ISOLATION}
            >
              <ClientIsolationAllowList />
            </Tabs.TabPane>
            {!isFoundation && <Tabs.TabPane
              tab={$t({ defaultMessage: 'Rogue APs' })}
              key={PolicyType.ROGUE_AP_DETECTION}
            >
              <VenueRogueAps />
            </Tabs.TabPane>}
          </>
        }
        {
          isEdgeHaReady && isEdgeFirewallHaReady && isAppliedFirewall &&
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Firewall' })}
            key={ServiceType.EDGE_FIREWALL}
          >
            <EdgeFirewall edgeData={edgeData as EdgeStatus}/>
          </Tabs.TabPane>
        }
        {
          edgeSdLanData &&
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
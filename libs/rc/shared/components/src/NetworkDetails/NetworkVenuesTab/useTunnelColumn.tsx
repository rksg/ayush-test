import { ReactNode } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {  Table }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  EdgeMvSdLanViewData,
  NetworkSaveData,
  PersonalIdentityNetworksViewData,
  Venue,
  useConfigTemplate
} from '@acx-ui/rc/utils'

import { SdLanScopedNetworkVenuesData } from '../../EdgeSdLan/useEdgeSdLanActions'
import {
  NetworkTunnelActionForm,
  NetworkTunnelActionModalProps,
  NetworkTunnelInfoButton,
  NetworkTunnelInfoLabel,
  NetworkTunnelSwitchBtn,
  NetworkTunnelTypeEnum,
  getNetworkTunnelType,
  useDeactivateNetworkTunnelByType,
  useEdgePinScopedNetworkVenueMap,
  useGetIpsecScopeNetworkMap,
  useGetSoftGreScopeNetworkMap
} from '../../NetworkTunnelActionModal'
import { useIsEdgeFeatureReady } from '../../useEdgeActions'

interface useTunnelColumnProps {
  network: NetworkSaveData | null | undefined
  sdLanScopedNetworkVenues: SdLanScopedNetworkVenuesData
  setTunnelModalState: (state: NetworkTunnelActionModalProps) => void
  refetchFnRef: React.MutableRefObject<{ [key: string]: () => void }>
}
export const useTunnelColumn = (props: useTunnelColumnProps) => {
  const { $t } = useIntl()
  const { network, sdLanScopedNetworkVenues, setTunnelModalState, refetchFnRef } = props
  const { isTemplate } = useConfigTemplate()

  const isEdgeMvSdLanReady = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isEdgePinHaReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgePinEnhanceReady = useIsSplitOn(Features.EDGE_PIN_ENHANCE_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isIpsecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const networkId = network?.id

  const deactivateNetworkTunnelByType = useDeactivateNetworkTunnelByType()
  const softGreVenueMap = useGetSoftGreScopeNetworkMap(networkId, refetchFnRef)
  const ipsecVenueMap = useGetIpsecScopeNetworkMap(networkId, refetchFnRef)
  const pinScopedNetworkVenues = useEdgePinScopedNetworkVenueMap(networkId, refetchFnRef)
  const isPinNetwork = Object.keys(pinScopedNetworkVenues).length > 0

  const handleClickNetworkTunnel = (currentVenue: Venue, currentNetwork: NetworkSaveData) => () => {
    const cachedSoftGre = networkId && softGreVenueMap[currentVenue.id] ?
      softGreVenueMap[currentVenue.id].filter(sg => sg.networkIds.includes(networkId)) : undefined

    // show modal
    setTunnelModalState({
      visible: true,
      network: {
        id: currentNetwork.id,
        type: currentNetwork.type,
        venueId: currentVenue.id,
        venueName: currentVenue.name
      },
      isPinNetwork,
      cachedSoftGre: cachedSoftGre ?? []
    } as NetworkTunnelActionModalProps)
  }

  if (isTemplate) return []

  return isEdgePinEnhanceReady || isIpsecEnabled
    ? [{
      key: 'tunneledInfo',
      title: $t({ defaultMessage: 'Network Tunneling' }),
      dataIndex: 'tunneledInfo',
      width: 200,
      align: 'left' as const,
      render: function (_: ReactNode, row: Venue) {
        if (!networkId || !row.activated?.isActivated) return null

        const networkInfo = {
          id: networkId,
          type: network.type!,
          venueId: row.id,
          venueName: row.name
        }
        const venueSdLanInfo = sdLanScopedNetworkVenues.sdLansVenueMap[row.id]?.[0]
        const venueSoftGre = softGreVenueMap[row.id]
        const targetSoftGre = venueSoftGre?.filter(sg => sg.networkIds.includes(networkId))
        const venueIpsec = ipsecVenueMap[row.id]
        const targetIpsec = venueIpsec?.filter(sg => sg.networkIds.includes(networkId))
        // eslint-disable-next-line max-len
        const venuePinInfo = (pinScopedNetworkVenues[row.id] as PersonalIdentityNetworksViewData[])?.[0]
        // eslint-disable-next-line max-len
        const tunnelType = getNetworkTunnelType(networkInfo, venueSoftGre, venueSdLanInfo, venuePinInfo)

        return <Space>
          <div><NetworkTunnelSwitchBtn
            tunnelType={tunnelType}
            venueSdLanInfo={venueSdLanInfo}
            onClick={async (checked) => {
              if (checked) {
                handleClickNetworkTunnel(row, network)()
              } else {
                const formValues = {
                  tunnelType: NetworkTunnelTypeEnum.None,
                  softGre: {
                    oldProfileId: targetSoftGre?.[0].profileId
                  },
                  ipsec: {
                    enableIpsec: targetIpsec && targetIpsec.length > 0,
                    oldProfileId: targetIpsec?.[0].profileId
                  }
                } as NetworkTunnelActionForm

                // deactivate depending on current tunnel type
                // eslint-disable-next-line max-len
                await deactivateNetworkTunnelByType(tunnelType, formValues, networkInfo, venueSdLanInfo)
              }
            }}
          /></div>
          <NetworkTunnelInfoLabel
            network={networkInfo}
            isVenueActivated={Boolean(row.activated?.isActivated)}
            venueSdLan={venueSdLanInfo}
            venueSoftGre={targetSoftGre?.[0]}
            venuePin={venuePinInfo}
            venueIpSec={targetIpsec?.[0]}
          />
        </Space>
      }
    }]
    : [...(((isEdgeMvSdLanReady || isSoftGreEnabled) && !isEdgePinHaReady) ? [{
      key: 'tunneledInfo',
      title: $t({ defaultMessage: 'Tunnel' }),
      dataIndex: 'tunneledInfo',
      render: function (_: ReactNode, row: Venue) {
        if (!networkId) return

        const cachedSoftGre = networkId && softGreVenueMap[row.id] ?
          softGreVenueMap[row.id].filter(sg => sg.networkIds.includes(networkId)) : undefined

        return <NetworkTunnelInfoButton
          network={network}
          currentVenue={row}
          venueSdLan={sdLanScopedNetworkVenues.sdLansVenueMap[row.id]?.[0]}
          venueSoftGre={cachedSoftGre?.[0]}
          onClick={handleClickNetworkTunnel(row, network)}
        />
      }
    }]: []),
    ...((isEdgePinHaReady) ?[{
      key: 'tunneledInfo',
      title: $t({ defaultMessage: 'Tunnel' }),
      dataIndex: 'tunneledInfo',
      children: [{
        key: 'tunneledInfo.activated',
        title: <Table.SubTitle>{$t({ defaultMessage: 'Activated' })}</Table.SubTitle>,
        dataIndex: 'tunneledInfo.activated',
        align: 'center',
        width: 80,
        minWidth: 80,
        render: function (_: ReactNode, row: Venue) {
          if (!networkId) return

          const networkInfo = {
            id: networkId,
            type: network.type!,
            venueId: row.id,
            venueName: row.name
          }
          // eslint-disable-next-line max-len
          const venueSdLanInfo = (sdLanScopedNetworkVenues.sdLansVenueMap[row.id] as EdgeMvSdLanViewData[])?.[0]
          const venueSoftGre = softGreVenueMap[row.id]
          const targetSoftGre = venueSoftGre?.filter(sg => sg.networkIds.includes(networkId))
          // eslint-disable-next-line max-len
          const venuePinInfo = (pinScopedNetworkVenues[row.id] as PersonalIdentityNetworksViewData[])?.[0]

          // eslint-disable-next-line max-len
          const tunnelType = getNetworkTunnelType(networkInfo, venueSoftGre, venueSdLanInfo, venuePinInfo)

          return row.activated?.isActivated
            ? <NetworkTunnelSwitchBtn
              tunnelType={tunnelType}
              venueSdLanInfo={venueSdLanInfo}
              onClick={(checked) => {
                if (checked) {
                  handleClickNetworkTunnel(row, network)()
                } else {
                  const formValues = {
                    tunnelType: NetworkTunnelTypeEnum.None,
                    softGre: {
                      oldProfileId: targetSoftGre?.[0].profileId
                    }
                  } as NetworkTunnelActionForm

                  // deactivate depending on current tunnel type
                  deactivateNetworkTunnelByType(tunnelType, formValues, networkInfo, venueSdLanInfo)
                }
              }}
            />
            : null
        }
      }, {
        key: 'tunneledInfo.networkTopology',
        title: <Table.SubTitle>{$t({ defaultMessage: 'Network Topology' })}</Table.SubTitle>,
        tooltip: $t({ defaultMessage:
        // eslint-disable-next-line max-len
        'Network traffic can be tunneled using SoftGRE or VxLAN. For VxLAN, in a <venueSingular></venueSingular>, you can choose either SD-LAN or Personal Identity Network (PIN) for DPSK network services, but not both.' }),
        dataIndex: 'tunneledInfo.networkTopology',
        width: 150,
        minWidth: 150,
        render: function (_: ReactNode, row: Venue) {
          if (!networkId) return

          const networkInfo = {
            id: networkId,
            type: network.type!,
            venueId: row.id,
            venueName: row.name
          }
          const venueSdLanInfo = sdLanScopedNetworkVenues.sdLansVenueMap[row.id]?.[0]
          const venueSoftGre = softGreVenueMap[row.id]
          const targetSoftGre = venueSoftGre?.filter(sg => sg.networkIds.includes(networkId))
          // eslint-disable-next-line max-len
          const venuePinInfo = (pinScopedNetworkVenues[row.id] as PersonalIdentityNetworksViewData[])?.[0]

          return <NetworkTunnelInfoLabel
            network={networkInfo}
            isVenueActivated={Boolean(row.activated?.isActivated)}
            venueSdLan={venueSdLanInfo}
            venueSoftGre={targetSoftGre?.[0]}
            venuePin={venuePinInfo}
          />
        }
      }]
    }]: [])
    ]
}
import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { Table }                  from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { NetworkSaveData, Venue } from '@acx-ui/rc/utils'

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
  useGetSoftGreScopeNetworkMap
} from '../../NetworkTunnelActionModal'
import { useIsEdgeFeatureReady } from '../../useEdgeActions'

interface useTunnelColumnProps {
  network: NetworkSaveData | null | undefined
  sdLanScopedNetworkVenues: SdLanScopedNetworkVenuesData
  setTunnelModalState: (state: NetworkTunnelActionModalProps) => void
}
export const useTunnelColumn = (props: useTunnelColumnProps) => {
  const { $t } = useIntl()
  const { network, sdLanScopedNetworkVenues, setTunnelModalState } = props

  const isEdgeMvSdLanReady = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isEdgePinHaReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const networkId = network?.id

  const deactivateNetworkTunnelByType = useDeactivateNetworkTunnelByType()
  const softGreVenueMap = useGetSoftGreScopeNetworkMap(networkId)
  const venuePinInfo = useEdgePinScopedNetworkVenueMap(networkId)

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
      cachedSoftGre: cachedSoftGre ?? []
    } as NetworkTunnelActionModalProps)
  }

  return [...(((isEdgeMvSdLanReady || isSoftGreEnabled) && !isEdgePinHaReady) ? [{
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
        const targetSoftGre = venueSoftGre?.filter(sg => sg.networkIds.includes(row.id))

        // eslint-disable-next-line max-len
        const tunnelType = getNetworkTunnelType(networkInfo, venueSoftGre, venueSdLanInfo, venuePinInfo)
        // eslint-disable-next-line max-len
        const isTheLastSdLanWlan = (venueSdLanInfo?.tunneledWlans?.length ?? 0) === 1 && tunnelType === NetworkTunnelTypeEnum.SdLan
        const disabled = isTheLastSdLanWlan || tunnelType === NetworkTunnelTypeEnum.Pin

        return row.activated?.isActivated
          ? <NetworkTunnelSwitchBtn
            checked={tunnelType !== NetworkTunnelTypeEnum.None}
            disabled={disabled}
            tooltip={isTheLastSdLanWlan
              // eslint-disable-next-line max-len
              ? $t({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' })
              : undefined}
            onClick={(checked) => {
              if (checked) {
                handleClickNetworkTunnel(row, network)()
              } else {
                const formValues: NetworkTunnelActionForm = {
                  tunnelType: NetworkTunnelTypeEnum.None,
                  sdLan: {
                    isGuestTunnelEnabled: venueSdLanInfo.isGuestTunnelEnabled!
                  },
                  softGre: {
                    newProfileId: targetSoftGre?.[0].profileId,
                    newProfileName: targetSoftGre?.[0].profileName,
                    oldProfileId: targetSoftGre?.[0].profileId
                  }
                }

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
      width: 100,
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
        const targetSoftGre = venueSoftGre?.filter(sg => sg.networkIds.includes(row.id))

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
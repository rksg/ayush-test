import { ReactNode } from 'react'

import { Space }   from 'antd'
import { find }    from 'lodash'
import { useIntl } from 'react-intl'

import { Table }                  from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  NetworkTunnelActionForm,
  NetworkTunnelActionModalProps,
  NetworkTunnelInfoLabel,
  NetworkTunnelSwitchBtn,
  NetworkTunnelTypeEnum,
  SdLanScopedVenueNetworksData,
  getNetworkTunnelType,
  transformSdLanScopedVenueMap,
  useDeactivateNetworkTunnelByType,
  useEdgeAllPinData,
  useGetIpsecScopeVenueMap,
  useGetSoftGreScopeVenueMap,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import { useVenuesListQuery }                                                      from '@acx-ui/rc/services'
import { EdgeMvSdLanViewData, Network, NetworkTypeEnum, useConfigTemplate, Venue } from '@acx-ui/rc/utils'

import { NetworkTunnelButton } from './NetworkTunnelButton'

export interface useTunnelColumnProps {
  venueId: string
  sdLanScopedNetworks: SdLanScopedVenueNetworksData
  setTunnelModalState: (state: NetworkTunnelActionModalProps) => void
  refetchFnRef: React.MutableRefObject<{ [key: string]: () => void }>,
  setIsTableUpdating: React.Dispatch<React.SetStateAction<boolean>>
}
export const useTunnelColumn = (props: useTunnelColumnProps) => {
  const { $t } = useIntl()
  const {
    venueId, sdLanScopedNetworks, setTunnelModalState,
    refetchFnRef,
    setIsTableUpdating
  } = props
  const { isTemplate } = useConfigTemplate()
  const isEdgeMvSdLanReady = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isEdgePinHaReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgePinEnhanceReady = useIsSplitOn(Features.EDGE_PIN_ENHANCE_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const deactivateNetworkTunnelByType = useDeactivateNetworkTunnelByType()
  const softGreVenueMap = useGetSoftGreScopeVenueMap(refetchFnRef)
  const ipsecVenueMap = useGetIpsecScopeVenueMap(refetchFnRef)

  // eslint-disable-next-line max-len
  const sdLanVenueMap = transformSdLanScopedVenueMap(sdLanScopedNetworks.sdLans as EdgeMvSdLanViewData[])
  const {
    venuePins: allPins,
    isUninitialized: isPinUninitialized,
    refetch
  } = useEdgeAllPinData({}, isTemplate)

  if (refetchFnRef && !isPinUninitialized) {
    refetchFnRef.current.pin = refetch
  }

  const venuePinInfo = find(allPins, p => p.venueId === venueId)
  const pinNetworkIds = allPins?.flatMap(p => p.tunneledWlans?.map(t => t.networkId))

  const { venueInfo } = useVenuesListQuery({ payload: {
    fields: ['name', 'id'],
    filters: { id: [venueId] }
  } }, {
    skip: !venueId || isTemplate,
    selectFromResult: ({ data }) => ({
      venueInfo: data?.data[0]
    })
  })

  const handleClickNetworkTunnel = (
    currentVenue: Venue, currentNetwork: Network,
    isPinNetwork?: boolean
  ) => {
    // eslint-disable-next-line max-len
    const cachedSoftGre = softGreVenueMap[currentVenue.id]?.filter(sg => sg.networkIds.includes(currentNetwork.id))
    setTunnelModalState({
      visible: true,
      network: {
        id: currentNetwork.id,
        type: currentNetwork.nwSubType,
        venueId: currentVenue.id,
        venueName: currentVenue.name
      },
      isPinNetwork,
      cachedSoftGre: cachedSoftGre ?? []
    } as NetworkTunnelActionModalProps)
  }

  if (isTemplate) return []

  return isEdgePinEnhanceReady || isIpSecOverNetworkEnabled
    ? [{
      key: 'tunneledInfo',
      title: $t({ defaultMessage: 'Network Tunneling' }),
      dataIndex: 'tunneledInfo',
      width: 200,
      align: 'left' as const,
      render: function (_: ReactNode, row: Network) {
        if (!venueId || !row.activated?.isActivated) return null

        const networkInfo = {
          id: row.id,
          type: row.nwSubType as NetworkTypeEnum,
          venueId: venueId,
          venueName: venueInfo?.name
        }
        const venueSdLanInfo = sdLanVenueMap[venueId]
        const venueSoftGre = softGreVenueMap[venueId]
        const targetSoftGre = venueSoftGre?.filter(sg => sg.networkIds.includes(row.id))
        const venueIpsec = ipsecVenueMap[venueId]
        const targetIpsec = venueIpsec?.filter(sg => sg.networkIds.includes(row.id))

        // eslint-disable-next-line max-len
        const tunnelType = getNetworkTunnelType(networkInfo, venueSoftGre, venueSdLanInfo, venuePinInfo)
        const isPinNetwork = !!pinNetworkIds?.includes(row.id)

        return <Space>
          <div><NetworkTunnelSwitchBtn
            tunnelType={tunnelType}
            venueSdLanInfo={venueSdLanInfo}
            onClick={async (checked) => {
              if (checked) {
                handleClickNetworkTunnel({
                  id: venueId,
                  name: venueInfo?.name,
                  activated: { isActivated: row.activated?.isActivated }
                } as Venue,
                row,
                isPinNetwork)
              } else {
                const formValues = {
                  tunnelType: NetworkTunnelTypeEnum.None,
                  softGre: {
                    oldProfileId: targetSoftGre?.[0].profileId
                  },
                  ipsec: {
                    enableIpsec: targetIpsec && targetIpsec.length > 0,
                    oldProfileId: (targetIpsec && targetIpsec.length > 0) ?
                      targetIpsec?.[0]?.profileId: undefined
                  }
                } as NetworkTunnelActionForm

                setIsTableUpdating(true)
                // deactivate depending on current tunnel type
                // eslint-disable-next-line max-len
                await deactivateNetworkTunnelByType(tunnelType, formValues, networkInfo, venueSdLanInfo)
                setIsTableUpdating(false)
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
    : [...(!isEdgePinHaReady && (isEdgeMvSdLanReady || isSoftGreEnabled) ? [{
      key: 'tunneledInfo',
      title: $t({ defaultMessage: 'Tunnel' }),
      dataIndex: 'tunneledInfo',
      render: function (_: ReactNode, row: Network) {
        return <NetworkTunnelButton
          currentVenue={{
            id: venueId,
            name: venueInfo?.name,
            activated: { isActivated: row.activated?.isActivated }
          } as Venue}
          currentNetwork={row}
          sdLanVenueMap={sdLanVenueMap}
          softGreVenueMap={softGreVenueMap}
          onClick={handleClickNetworkTunnel}
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
        render: function (_: ReactNode, row: Network) {
          const networkInfo = {
            id: row.id,
            type: row.nwSubType as NetworkTypeEnum,
            venueId: venueId,
            venueName: venueInfo?.name
          }
          const venueSdLanInfo = sdLanVenueMap[venueId]
          const venueSoftGre = softGreVenueMap[venueId]
          const targetSoftGre = venueSoftGre?.filter(sg => sg.networkIds.includes(row.id))

          // eslint-disable-next-line max-len
          const tunnelType = getNetworkTunnelType(networkInfo, venueSoftGre, venueSdLanInfo, venuePinInfo)
          const isPinNetwork = !!pinNetworkIds?.includes(row.id)

          return row.activated?.isActivated
            ? <NetworkTunnelSwitchBtn
              tunnelType={tunnelType}
              venueSdLanInfo={venueSdLanInfo}
              onClick={(checked) => {
                if (checked) {
                  handleClickNetworkTunnel({
                    id: venueId,
                    name: venueInfo?.name,
                    activated: { isActivated: row.activated?.isActivated }
                  } as Venue,
                  row,
                  isPinNetwork)
                } else {
                  const formValues = {
                    tunnelType: NetworkTunnelTypeEnum.None,
                    softGre: {
                      oldProfileId: targetSoftGre?.[0].profileId
                    }
                  } as NetworkTunnelActionForm

                  // deactivate depending on current tunnel type
                  // eslint-disable-next-line max-len
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
        render: function (_: ReactNode, row: Network) {
          const networkInfo = {
            id: row.id,
            type: row.nwSubType as NetworkTypeEnum,
            venueId: venueId,
            venueName: venueInfo?.name
          }
          const venueSdLanInfo = sdLanVenueMap[venueId]
          const venueSoftGre = softGreVenueMap[venueId]
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
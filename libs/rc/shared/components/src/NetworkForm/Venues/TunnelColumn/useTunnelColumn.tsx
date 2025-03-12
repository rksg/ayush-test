import { ReactNode, useMemo } from 'react'

import { Form }      from 'antd'
import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { StepsForm, Table }          from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  NetworkSaveData,
  NetworkTunnelSdLanAction,
  Venue,
  useConfigTemplate,
  PersonalIdentityNetworksViewData
} from '@acx-ui/rc/utils'

import { SdLanScopedNetworkVenuesData } from '../../../EdgeSdLan/useEdgeSdLanActions'
import {
  NetworkTunnelActionModalProps,
  NetworkTunnelInfoLabel,
  SoftGreNetworkTunnel,
  useEdgePinScopedNetworkVenueMap
} from '../../../NetworkTunnelActionModal'
import { mergeSdLanCacheAct }              from '../../../NetworkTunnelActionModal/utils'
import { useIsEdgeFeatureReady }           from '../../../useEdgeActions'
import { TMP_NETWORK_ID }                  from '../../utils'
import { NetworkTunnelInfoButtonFormItem } from '../NetworkTunnelInfoButtonFormItem'

import { NetworkTunnelSwitch } from './NetworkTunnelSwitch'

interface useTunnelColumnProps {
  network: NetworkSaveData | null | undefined
  sdLanScopedNetworkVenues: SdLanScopedNetworkVenuesData
  softGreVenueMap: Record<string, SoftGreNetworkTunnel[]>
  setTunnelModalState: (state: NetworkTunnelActionModalProps) => void
}
export const useTunnelColumn = (props: useTunnelColumnProps) => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isEdgePinHaEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgePinEnhanceReady = useIsSplitOn(Features.EDGE_PIN_ENHANCE_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isIpSecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const {
    network,
    sdLanScopedNetworkVenues,
    softGreVenueMap,
    setTunnelModalState
  } = props
  const form = Form.useFormInstance()
  const networkId = network?.id ?? TMP_NETWORK_ID

  const pinScopedNetworkVenues = useEdgePinScopedNetworkVenueMap(networkId)
  const isPinNetwork = Object.keys(pinScopedNetworkVenues).length > 0

  const softGreAssociationUpdate = Form.useWatch('softGreAssociationUpdate')
  // eslint-disable-next-line max-len
  const sdLanAssociationUpdate = Form.useWatch('sdLanAssociationUpdate') as NetworkTunnelSdLanAction[]

  const cachedSdLanNetworkVenues = useMemo(() => {
    const result = cloneDeep(sdLanScopedNetworkVenues)

    sdLanAssociationUpdate?.forEach((actInfo) => {
      if (actInfo.enabled) {
        const target = result.sdLansVenueMap[actInfo.venueId]

        // target is undefined when
        //   1. Add network mode.
        //   2. this network venue is not activated on the query result SD-LAN
        if (target) {
          target[0] = mergeSdLanCacheAct(target[0], [actInfo])
        } else {
          // eslint-disable-next-line max-len
          const mergedSdlan = mergeSdLanCacheAct(cloneDeep(actInfo.venueSdLanInfo!), [actInfo])
          result.sdLansVenueMap[actInfo.venueId]= [mergedSdlan]
        }
      } else {
        delete result.sdLansVenueMap[actInfo.venueId]
      }
    })

    return result
  }, [sdLanScopedNetworkVenues, sdLanAssociationUpdate])

  const getCachedSoftGre = (venueId: string, networkId: string) => {
    const updateSoftGre = softGreAssociationUpdate && softGreAssociationUpdate[venueId]
    if (updateSoftGre) {
      if (updateSoftGre.newProfileId === '') return []

      return [{ venueId,
        networkIds: [networkId],
        profileId: updateSoftGre.newProfileId,
        profileName: updateSoftGre.newProfileName }]
    } else if (networkId !== TMP_NETWORK_ID) {
      const softGreVenue = softGreVenueMap?.[venueId]?.find(sg => sg.networkIds.includes(networkId))
      if (softGreVenue) return [softGreVenue]
    }
    return []
  }

  const handleClickNetworkTunnel = (currentVenue: Venue, currentNetwork: NetworkSaveData) => {
    const cachedActs = form.getFieldValue('sdLanAssociationUpdate') as NetworkTunnelSdLanAction[]
    const venueId = currentVenue.id
    const cachedSoftGre = getCachedSoftGre(venueId, networkId)

    // show modal
    setTunnelModalState({
      visible: true,
      network: {
        id: networkId,
        type: currentNetwork?.type,
        venueId,
        venueName: currentVenue.name
      },
      isPinNetwork,
      cachedActs,
      cachedSoftGre
    } as NetworkTunnelActionModalProps)
  }

  if (isTemplate) return []

  return isEdgePinEnhanceReady || isIpSecEnabled
    ? [{
      key: 'tunneledInfo',
      title: $t({ defaultMessage: 'Network Tunneling' }),
      dataIndex: 'tunneledInfo',
      width: 180,
      align: 'center' as const,
      render: function (_: ReactNode, row: Venue) {
        if (!network || !row.activated?.isActivated) return null

        const networkInfo = {
          id: networkId,
          type: network.type!,
          venueId: row.id,
          venueName: row.name
        }

        const cachedSoftGre = getCachedSoftGre(row.id, networkId)
        const cachedVenueSdLanInfo = cachedSdLanNetworkVenues.sdLansVenueMap[row.id]?.[0]
        const venueSdLanInfo = sdLanScopedNetworkVenues.sdLansVenueMap[row.id]?.[0]
        // eslint-disable-next-line max-len
        const venuePinInfo = (pinScopedNetworkVenues[row.id] as PersonalIdentityNetworksViewData[])?.[0]

        return <StepsForm.FieldLabel width='50px'>
          <div><NetworkTunnelSwitch
            currentVenue={row}
            currentNetwork={{
              ...network,
              id: networkId
            }}
            cachedVenueSdLanInfo={cachedVenueSdLanInfo}
            venueSdLanInfo={venueSdLanInfo}
            venuePinInfo={venuePinInfo}
            venueSoftGre={cachedSoftGre}
            onClick={handleClickNetworkTunnel}
          /></div>
          <NetworkTunnelInfoLabel
            network={networkInfo}
            isVenueActivated={Boolean(row.activated?.isActivated)}
            venueSdLan={venueSdLanInfo}
            venueSoftGre={cachedSoftGre?.[0]}
            venuePin={venuePinInfo}
          />
        </StepsForm.FieldLabel>
      }
    }]
    : [ ...(!isEdgePinHaEnabled && (isEdgeSdLanMvEnabled || isSoftGreEnabled) ? [{
      key: 'tunneledInfo',
      title: $t({ defaultMessage: 'Tunnel' }),
      dataIndex: 'tunneledInfo',
      render: function (_: ReactNode, row: Venue) {
        return network
          ? <Form.Item noStyle name={['sdLanAssociationUpdate']}>
            <NetworkTunnelInfoButtonFormItem
              currentVenue={row}
              currentNetwork={network}
              sdLanScopedNetworkVenues={sdLanScopedNetworkVenues}
              softGreVenueMap={softGreVenueMap}
              softGreAssociationUpdate={softGreAssociationUpdate}
              onClick={handleClickNetworkTunnel}
            />
          </Form.Item>
          : ''
      }
    }]: []),
    ...((isEdgePinHaEnabled) ?[{
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
          if (!network) return

          const cachedSoftGre = getCachedSoftGre(row.id, networkId)
          const cachedVenueSdLanInfo = cachedSdLanNetworkVenues.sdLansVenueMap[row.id]?.[0]
          const venueSdLanInfo = sdLanScopedNetworkVenues.sdLansVenueMap[row.id]?.[0]
          // eslint-disable-next-line max-len
          const venuePinInfo = (pinScopedNetworkVenues[row.id] as PersonalIdentityNetworksViewData[])?.[0]

          return row.activated?.isActivated
            ? <NetworkTunnelSwitch
              currentVenue={row}
              currentNetwork={{
                ...network,
                id: networkId
              }}
              cachedVenueSdLanInfo={cachedVenueSdLanInfo}
              venueSdLanInfo={venueSdLanInfo}
              venuePinInfo={venuePinInfo}
              venueSoftGre={cachedSoftGre}
              onClick={handleClickNetworkTunnel}
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
          if (!network) return

          const networkInfo = {
            id: networkId,
            type: network.type!,
            venueId: row.id,
            venueName: row.name
          }
          const venueSdLanInfo = cachedSdLanNetworkVenues.sdLansVenueMap[row.id]?.[0]
          const cachedSoftGre = getCachedSoftGre(row.id, networkId)
          // eslint-disable-next-line max-len
          const venuePinInfo = (pinScopedNetworkVenues[row.id] as PersonalIdentityNetworksViewData[])?.[0]

          return <NetworkTunnelInfoLabel
            network={networkInfo}
            isVenueActivated={Boolean(row.activated?.isActivated)}
            venueSdLan={venueSdLanInfo}
            venueSoftGre={cachedSoftGre?.[0]}
            venuePin={venuePinInfo}
          />
        }
      }]
    }]: [])
    ]
}
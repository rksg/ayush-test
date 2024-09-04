import { cloneDeep } from 'lodash'

import { NetworkSaveData, Venue, NetworkTunnelSdLanAction } from '@acx-ui/rc/utils'

import { SdLanScopedNetworkVenuesData } from '../../EdgeSdLan/useEdgeSdLanActions'
import { SoftGreNetworkTunnel }         from '../../NetworkTunnelActionModal'
import { NetworkTunnelInfoButton }      from '../../NetworkTunnelActionModal/NetworkTunnelInfoButton'
import { mergeSdLanCacheAct }           from '../../NetworkTunnelActionModal/utils'
import { TMP_NETWORK_ID }               from '../utils'

interface NetworkTunnelInfoButtonFormItemProps {
  value?: NetworkTunnelSdLanAction[]
  currentVenue: Venue
  currentNetwork: NetworkSaveData
  sdLanScopedNetworkVenues: SdLanScopedNetworkVenuesData,
  softGreVenueMap: Record<string, SoftGreNetworkTunnel[]>
  onClick: (currentVenue: Venue, currentNetwork: NetworkSaveData) => void
}

export const NetworkTunnelInfoButtonFormItem = (props: NetworkTunnelInfoButtonFormItemProps) => {
  const {
    value: cachedActs,
    currentVenue,
    currentNetwork,
    sdLanScopedNetworkVenues,
    softGreVenueMap,
    onClick
  } = props

  const handleClick = () => {
    onClick(currentVenue, currentNetwork)
  }

  const sdLanNetworkVenues = cloneDeep(sdLanScopedNetworkVenues)

  cachedActs?.forEach((actInfo) => {
    if (actInfo.enabled) {
      const target = sdLanNetworkVenues.sdLansVenueMap[actInfo.venueId]

      // target is undefined when
      //   1. Add network mode.
      //   2. this network venue is not activated on the query result SD-LAN
      if (target) {
        target[0] = mergeSdLanCacheAct(target[0], [actInfo])
      } else {
        // eslint-disable-next-line max-len
        const mergedSdlan = mergeSdLanCacheAct(cloneDeep(actInfo.venueSdLanInfo!), [actInfo])
        sdLanNetworkVenues.sdLansVenueMap[actInfo.venueId]= [mergedSdlan]
      }
    } else {
      delete sdLanNetworkVenues.sdLansVenueMap[actInfo.venueId]
    }
  })

  const networkId = currentNetwork.id ?? ''
  const venueSoftGre = softGreVenueMap[currentVenue.id]?.find(sg =>
    sg.networkIds.includes(networkId))

  return <NetworkTunnelInfoButton
    network={{
      ...currentNetwork,
      id: currentNetwork.id ?? TMP_NETWORK_ID
    }}
    currentVenue={currentVenue}
    venueSdLan={sdLanNetworkVenues.sdLansVenueMap?.[currentVenue.id]?.[0]}
    venueSoftGre={venueSoftGre}
    onClick={handleClick}
  />
}
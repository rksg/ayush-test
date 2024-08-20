import { cloneDeep } from 'lodash'

import { NetworkSaveData, Venue, NetworkTunnelSdLanAction } from '@acx-ui/rc/utils'

import { SdLanScopedNetworkVenuesData } from '../../EdgeSdLan/useEdgeSdLanActions'
import { NetworkTunnelInfoButton }      from '../../NetworkTunnelActionModal/NetworkTunnelInfoButton'
import { mergeSdLanCacheAct }           from '../../NetworkTunnelActionModal/utils'
import { TMP_NETWORK_ID }               from '../utils'

interface NetworkTunnelInfoButtonFormItemProps {
  value?: NetworkTunnelSdLanAction[]
  currentVenue: Venue
  currentNetwork: NetworkSaveData
  sdLanScopedNetworkVenues: SdLanScopedNetworkVenuesData
  onClick: (currentVenue: Venue, currentNetwork: NetworkSaveData) => void
}

export const NetworkTunnelInfoButtonFormItem = (props: NetworkTunnelInfoButtonFormItemProps) => {
  const {
    value: cachedActs,
    currentVenue,
    currentNetwork,
    sdLanScopedNetworkVenues,
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

  return <NetworkTunnelInfoButton
    network={{
      ...currentNetwork,
      id: currentNetwork.id ?? TMP_NETWORK_ID
    }}
    currentVenue={currentVenue}
    venueSdLan={sdLanNetworkVenues.sdLansVenueMap?.[currentVenue.id]?.[0]}
    onClick={handleClick}
  />
}
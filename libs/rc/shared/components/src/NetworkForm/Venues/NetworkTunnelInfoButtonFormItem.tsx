import { cloneDeep } from 'lodash'

import { NetworkSaveData, Venue, NetworkTunnelSdLanAction, NetworkTunnelSoftGreAction } from '@acx-ui/rc/utils'

import { SdLanScopedNetworkVenuesData } from '../../EdgeSdLan/useEdgeSdLanActions'
import { SoftGreNetworkTunnel }         from '../../NetworkTunnelActionModal'
import { NetworkTunnelInfoButton }      from '../../NetworkTunnelActionModal/NetworkTunnelInfoButton'
import { mergeSdLanCacheAct }           from '../../NetworkTunnelActionModal/utils'
import { TMP_NETWORK_ID }               from '../utils'

interface NetworkTunnelInfoButtonFormItemProps {
  value?: NetworkTunnelSdLanAction[]
  currentVenue: Venue
  currentNetwork: NetworkSaveData
  sdLanScopedNetworkVenues: SdLanScopedNetworkVenuesData
  softGreVenueMap: Record<string, SoftGreNetworkTunnel[]>
  softGreAssociationUpdate: NetworkTunnelSoftGreAction
  onClick: (currentVenue: Venue, currentNetwork: NetworkSaveData) => void
}

export const NetworkTunnelInfoButtonFormItem = (props: NetworkTunnelInfoButtonFormItemProps) => {
  const {
    value: cachedActs,
    currentVenue,
    currentNetwork,
    sdLanScopedNetworkVenues,
    softGreVenueMap,
    softGreAssociationUpdate,
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

  const getVenueSoftGre = () => {
    if (softGreAssociationUpdate?.[currentVenue.id]) {
      const { newProfileId, newProfileName } = softGreAssociationUpdate[currentVenue.id]
      return {
        venueId: currentVenue.id,
        networkIds: [TMP_NETWORK_ID],
        profileId: newProfileId,
        profileName: newProfileName
      } as SoftGreNetworkTunnel
    }
    return softGreVenueMap?.[currentVenue.id]?.find(sg => sg.networkIds.includes(networkId))
  }

  return <NetworkTunnelInfoButton
    network={{
      ...currentNetwork,
      id: currentNetwork.id ?? TMP_NETWORK_ID
    }}
    currentVenue={currentVenue}
    venueSdLan={sdLanNetworkVenues.sdLansVenueMap?.[currentVenue.id]?.[0]}
    venueSoftGre={getVenueSoftGre()}
    onClick={handleClick}
  />
}
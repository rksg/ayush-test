import { find } from 'lodash'

import { NetworkTunnelInfoButton, SoftGreNetworkTunnel } from '@acx-ui/rc/components'
import { EdgeMvSdLanViewData, Network, Venue }           from '@acx-ui/rc/utils'

interface NetworkTunnelButtonProps {
  currentVenue: Venue
  currentNetwork: Network
  sdLanVenueMap: Record<string, EdgeMvSdLanViewData>,
  softGreVenueMap: Record<string, SoftGreNetworkTunnel[]>
  onClick: (currentVenue: Venue, currentNetwork: Network) => void
}

export const NetworkTunnelButton = (props: NetworkTunnelButtonProps) => {
  const { currentVenue, currentNetwork, sdLanVenueMap, softGreVenueMap, onClick } = props
  const venueId = currentVenue.id

  let venueSdLan: EdgeMvSdLanViewData | undefined = undefined
  if (venueId && sdLanVenueMap[venueId]) {
    const isSdLanNetwork = Boolean(
      find(sdLanVenueMap[venueId]?.tunneledWlans, { venueId, networkId: currentNetwork.id }))

    venueSdLan = isSdLanNetwork ? sdLanVenueMap[venueId] : undefined
  }

  let venueSoftGre: SoftGreNetworkTunnel | undefined = undefined
  if (venueId && softGreVenueMap[venueId] && currentNetwork.id) {
    venueSoftGre = softGreVenueMap[venueId]?.find(sg => sg.networkIds.includes(currentNetwork.id))
  }

  const handleClick = () => {
    onClick(currentVenue, currentNetwork)
  }

  return <NetworkTunnelInfoButton
    network={currentNetwork}
    currentVenue={currentVenue}
    venueSdLan={venueSdLan}
    venueSoftGre={venueSoftGre}
    onClick={handleClick}
  />
}
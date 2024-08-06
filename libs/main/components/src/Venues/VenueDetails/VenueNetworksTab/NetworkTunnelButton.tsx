import { find } from 'lodash'

import { NetworkTunnelInfoButton }             from '@acx-ui/rc/components'
import { EdgeMvSdLanViewData, Network, Venue } from '@acx-ui/rc/utils'

interface NetworkTunnelButtonProps {
  currentVenue: Venue
  currentNetwork: Network
  sdLanVenueMap: Record<string, EdgeMvSdLanViewData>
  onClick: (currentVenue: Venue, currentNetwork: Network) => void
}

export const NetworkTunnelButton = (props: NetworkTunnelButtonProps) => {
  const { currentVenue, currentNetwork, sdLanVenueMap, onClick } = props
  const venueId = currentVenue.id

  let venueSdLan: EdgeMvSdLanViewData | undefined = undefined
  if (venueId && sdLanVenueMap[venueId]) {
    const isSdLanNetwork = Boolean(
      find(sdLanVenueMap[venueId]?.tunneledWlans, { venueId, networkId: currentNetwork.id }))

    venueSdLan = isSdLanNetwork ? sdLanVenueMap[venueId] : undefined
  }

  const handleClick = () => {
    onClick(currentVenue, currentNetwork)
  }

  return <NetworkTunnelInfoButton
    network={currentNetwork}
    currentVenue={currentVenue}
    venueSdLan={venueSdLan}
    onClick={handleClick}
  />
}
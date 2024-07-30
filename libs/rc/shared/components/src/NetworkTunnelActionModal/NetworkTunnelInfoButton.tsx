import { useIntl } from 'react-intl'

import { Button }                          from '@acx-ui/components'
import { Network, NetworkSaveData, Venue } from '@acx-ui/rc/utils'

import { isGuestTunnelUtilized }        from '../EdgeSdLan/edgeSdLanUtils'
import { SdLanScopedNetworkVenuesData } from '../EdgeSdLan/useEdgeSdLanActions'

interface NetworkTunnelInfoButtonProps {
  network?: Network | NetworkSaveData | null
  currentVenue: Venue
  onClick: () => void
  sdLanScopedNetworkVenues: SdLanScopedNetworkVenuesData
}

export const NetworkTunnelInfoButton = (props: NetworkTunnelInfoButtonProps) => {
  const { $t } = useIntl()
  const { network, currentVenue, onClick, sdLanScopedNetworkVenues } = props

  if (Boolean(currentVenue.activated?.isActivated)) {
    const venueId = currentVenue.id

    const destinationsInfo = sdLanScopedNetworkVenues?.sdLansVenueMap[venueId]?.[0]
    const isTunneled = !!destinationsInfo
    // eslint-disable-next-line max-len
    const clusterName = (isTunneled && isGuestTunnelUtilized(destinationsInfo, network?.id!, venueId))
      ? destinationsInfo?.guestEdgeClusterName
      : destinationsInfo?.edgeClusterName

    return <Button type='link'
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}>
      {!!destinationsInfo
        ? $t({ defaultMessage: 'Tunneled ({clusterName})' },
          { clusterName })
        : $t({ defaultMessage: 'Local Breakout' })
      }
    </Button>
  } else {
    return null
  }
}
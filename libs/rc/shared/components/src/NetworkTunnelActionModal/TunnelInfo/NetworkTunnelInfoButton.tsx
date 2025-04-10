import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'
import { EdgeMvSdLanViewData, Network, NetworkSaveData, Venue } from '@acx-ui/rc/utils'

import { isDmzTunnelUtilized } from '../../EdgeSdLan/edgeSdLanUtils'
import { SoftGreNetworkTunnel } from '../useSoftGreTunnelActions'

interface NetworkTunnelInfoButtonProps {
  network?: Network | NetworkSaveData | null
  currentVenue: Venue
  onClick: () => void
  venueSdLan?: EdgeMvSdLanViewData,
  venueSoftGre?: SoftGreNetworkTunnel
}

//Deprecated, PIN and SDLAN FF has global on
export const NetworkTunnelInfoButton = (props: NetworkTunnelInfoButtonProps) => {
  const { $t } = useIntl()
  const { network, currentVenue, onClick, venueSdLan, venueSoftGre } = props

  if (Boolean(currentVenue.activated?.isActivated)) {
    const venueId = currentVenue.id

    const isTunneled = !!venueSdLan || !!venueSoftGre
    // eslint-disable-next-line max-len
    const clusterName = (isDmzTunnelUtilized(venueSdLan, network?.id!, venueId))
      ? venueSdLan?.guestEdgeClusterName
      : venueSdLan?.edgeClusterName

    const softGreClusterName = network?.id && venueSoftGre && venueSoftGre.profileName

    return <Button type='link'
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}>
      {isTunneled
        ? $t({ defaultMessage: 'Tunneled ({clusterName})' },
          { clusterName: venueSoftGre ? softGreClusterName : clusterName })
        : $t({ defaultMessage: 'Local Breakout' })
      }
    </Button>
  } else {
    return null
  }
}
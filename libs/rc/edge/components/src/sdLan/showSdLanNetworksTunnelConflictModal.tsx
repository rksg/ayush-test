import { find } from 'lodash'

import { showActionModal }       from '@acx-ui/components'
import { EdgeSdLanTunneledWlan } from '@acx-ui/rc/utils'
import { getIntl }               from '@acx-ui/utils'

interface ShowSdLanNetworksTunnelConflictProps {
  currentNetworkVenueId: string
  currentNetworkId: string
  currentNetworkName?: string
  tunnelProfileId: string
  tunneledWlans: EdgeSdLanTunneledWlan[]
  onOk: (impactVenueIds: string[]) => Promise<void> | void
  onCancel?: () => void
}
export const showSdLanNetworksTunnelConflictModal =
(props: ShowSdLanNetworksTunnelConflictProps) => {
  const {
    currentNetworkVenueId,
    currentNetworkId,
    currentNetworkName,
    tunnelProfileId,
    tunneledWlans = [],
    onOk,
    onCancel
  } = props
  const { $t } = getIntl()

  let impactVenueIds: string[] = []
  let networkName: string = ''

  networkName = find(tunneledWlans, { networkId: currentNetworkId })?.networkName ?? ''

  impactVenueIds = (tunneledWlans)
    .filter(n => n.networkId === currentNetworkId
        && n.venueId !== currentNetworkVenueId
        && n.forwardingTunnelProfileId !== tunnelProfileId)
    .map(i => i.venueId)

  const impactVenueCount = impactVenueIds.length

  if (impactVenueCount === 0) {
    onOk(impactVenueIds)
    return
  }

  showActionModal({
    type: 'confirm',
    title: $t({ defaultMessage: 'Configuration Conflict Detected' }),
    content: $t({ defaultMessage:
        // eslint-disable-next-line max-len
        `The "Forwarding Destination" setting must be consistent across all <venuePlural></venuePlural> in the same network and SD-LAN profile. 
        Changing this setting for Network {networkName} 
        will also affect <b>{impactVenueCount}</b> associated {impactVenueCount, plural,
        one {<venueSingular></venueSingular>}
        other {<venuePlural></venuePlural>}}. 
        Do you want to continue?` },
    {
      networkName: <b>{currentNetworkName || networkName}</b>,
      impactVenueCount: impactVenueCount,
      b: chunks => <b>{chunks}</b>
    }),
    okText: $t({ defaultMessage: 'Continue' }),
    onOk: async () => {
      await onOk(impactVenueIds)
    },
    onCancel: onCancel
  })
}
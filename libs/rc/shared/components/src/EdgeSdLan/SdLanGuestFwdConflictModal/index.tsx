import { find } from 'lodash'

import { defaultRichTextFormatValues, showActionModal }  from '@acx-ui/components'
import { EdgeMvSdLanFormNetwork, EdgeSdLanTunneledWlan } from '@acx-ui/rc/utils'
import { getIntl }                                       from '@acx-ui/utils'

interface showSdLanGuestFwdConflictModalProps {
  currentNetworkVenueId: string
  currentNetworkId: string
  currentNetworkName?: string
  currentFwdTunnelType?: string
  activatedDmz: boolean
  tunneledWlans: EdgeSdLanTunneledWlan[] | EdgeMvSdLanFormNetwork | undefined
  tunneledGuestWlans: EdgeSdLanTunneledWlan[] | EdgeMvSdLanFormNetwork | undefined
  onOk: (impactVenueIds: string[]) => Promise<void> | void
  onCancel?: () => void
  isL2oGreReady?: boolean
}
export const showSdLanGuestFwdConflictModal = (props: showSdLanGuestFwdConflictModalProps) => {
  const {
    currentNetworkVenueId,
    currentNetworkId,
    currentNetworkName,
    currentFwdTunnelType,
    activatedDmz,
    tunneledWlans,
    tunneledGuestWlans,
    isL2oGreReady,
    onOk,
    onCancel
  } = props
  const { $t } = getIntl()
  const isWizardFormNetwork = !Array.isArray(tunneledWlans)

  let impactVenueIds: string[] = []
  let networkName: string = ''

  if (isWizardFormNetwork) {
    const activatedNetworks = (tunneledWlans ?? {}) as EdgeMvSdLanFormNetwork
    const activatedGuestNetworks = (tunneledGuestWlans ?? {}) as EdgeMvSdLanFormNetwork

    networkName = find(activatedNetworks[currentNetworkVenueId],
      { id: currentNetworkId })?.name ?? ''

    impactVenueIds = Object.entries(activatedNetworks)
      .flatMap(([vId, networks]) => {
        if (vId === currentNetworkVenueId) {
          return undefined
        }

        return networks.map(n => {
          const activatedStateDiff = Boolean(find(activatedGuestNetworks[vId],
            { id: currentNetworkId })) === !activatedDmz

          if (n.id === currentNetworkId && activatedStateDiff) {
            return vId
          }

          return undefined
        })
      })
      .filter(v => !!v) as string[]
  } else {
    const typedTunneledWlans = (tunneledWlans ?? []) as EdgeSdLanTunneledWlan[]
    const typedTunneledGuestWlans = (tunneledGuestWlans ?? []) as EdgeSdLanTunneledWlan[]

    networkName = find(typedTunneledWlans, { networkId: currentNetworkId })?.networkName ?? ''

    impactVenueIds = (typedTunneledWlans)
      .filter(n => {
        let isDiffState = false
        if (isL2oGreReady) {
          isDiffState = n.forwardingTunnelType !== currentFwdTunnelType
        }else{
          // eslint-disable-next-line max-len
          isDiffState = (typedTunneledGuestWlans?.some(g => g.networkId === currentNetworkId && g.venueId === n.venueId) === !activatedDmz)
        }

        return n.networkId === currentNetworkId
         && n.venueId !== currentNetworkVenueId
         && isDiffState }
      ).map(i => i.venueId)
  }

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
        `The "{isL2oGreReady, select, true {Forwarding Destination} other {Forward the guest traffic to DMZ}}" setting must be consistent across all <venuePlural></venuePlural> in the same network and SD-LAN profile. 
        Changing this setting for Network <b>{networkName}</b>
        will also affect <b>{impactVenueCount}</b> associated {impactVenueCount, plural,
        one {<venueSingular></venueSingular>}
        other {<venuePlural></venuePlural>}}. 
        Do you want to continue?` },
    {
      ...defaultRichTextFormatValues,
      isL2oGreReady,
      networkName: currentNetworkName || networkName,
      impactVenueCount: impactVenueCount
    }),
    okText: $t({ defaultMessage: 'Continue' }),
    onOk: async () => {
      await onOk(impactVenueIds)
    },
    onCancel: onCancel
  })
}
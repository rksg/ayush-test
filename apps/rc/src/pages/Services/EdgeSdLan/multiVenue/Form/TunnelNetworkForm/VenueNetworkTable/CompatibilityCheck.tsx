import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  ApCompatibilityToolTip,
  ApGeneralCompatibilityDrawer,
  ApCompatibilityType,
  CompatibilityWarningCircleIcon } from '@acx-ui/rc/components'
import { useGetApCompatibilitiesVenueQuery } from '@acx-ui/rc/services'
import { IncompatibilityFeatures }           from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export const CompatibilityCheck = ({ venueId, venueName } : { venueId: string, venueName?: string }) => {
  const { $t } = useIntl()

  const [open, setOpen] = useState<boolean>(false)

  const { isSdLanIncompatible } = useGetApCompatibilitiesVenueQuery({
    params: { venueId },
    payload: { filters: {}, featureName: IncompatibilityFeatures.SD_LAN }
  }, {
    selectFromResult: ({ data }) => ({
      // eslint-disable-next-line max-len
      isSdLanIncompatible: Boolean(data?.apCompatibilities[0].incompatible) && !!data?.apCompatibilities[0]?.incompatibleFeatures?.[0]?.requiredFw
    })
  })

  const { isTunnelProfileIncompatible } = useGetApCompatibilitiesVenueQuery({
    params: { venueId },
    payload: { filters: {}, featureName: IncompatibilityFeatures.TUNNEL_PROFILE }
  }, {
    selectFromResult: ({ data }) => ({
      // eslint-disable-next-line max-len
      isTunnelProfileIncompatible: Boolean(data?.apCompatibilities[0].incompatible) && !!data?.apCompatibilities[0]?.incompatibleFeatures?.[0]?.requiredFw
    })
  })

  const isIncompatible = isSdLanIncompatible || isTunnelProfileIncompatible

  return isIncompatible
    ? <>
      <ApCompatibilityToolTip
      // eslint-disable-next-line max-len
        title={$t({ defaultMessage: 'Some APs lower than the minimum firmware version may not setup tunneling.' })}
        visible={true}
        icon={<CompatibilityWarningCircleIcon />}
        onClick={() => setOpen(true)}
      />
      {open && <ApGeneralCompatibilityDrawer
        visible={open}
        type={ApCompatibilityType.VENUE}
        venueId={venueId}
        venueName={venueName}
        featureName={IncompatibilityFeatures.SD_LAN}
        requiredFeatures={[IncompatibilityFeatures.TUNNEL_PROFILE]}
        isFeatureEnabledRegardless
        onClose={() => setOpen(false)}
      />}
    </>
    : null
}
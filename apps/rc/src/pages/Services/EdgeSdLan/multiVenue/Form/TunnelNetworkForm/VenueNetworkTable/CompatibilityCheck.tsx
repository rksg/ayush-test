import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  IncompatibilityFeatures,
  ApCompatibilityToolTip,
  ApGeneralCompatibilityDrawer,
  ApCompatibilityType,
  CompatibilityWarningCircleIcon } from '@acx-ui/rc/components'
import { useGetApCompatibilitiesVenueQuery } from '@acx-ui/rc/services'

// eslint-disable-next-line max-len
export const CompatibilityCheck = ({ venueId, venueName } : { venueId: string, venueName?: string }) => {
  const { $t } = useIntl()

  const [open, setOpen] = useState<boolean>(false)

  const { data } = useGetApCompatibilitiesVenueQuery({
    params: { venueId },
    payload: { filters: {}, featureName: IncompatibilityFeatures.SD_LAN }
  })

  const isIncompatible = Boolean(data?.apCompatibilities[0].incompatible)

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
        isMultiple={false}
        onClose={() => setOpen(false)}
      />}
    </>
    : null
}
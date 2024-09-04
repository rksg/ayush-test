import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  ApGeneralCompatibilityDrawer as EnhancedApCompatibilityDrawer,
  ApCompatibilityType,
  CompatibleAlertBanner } from '@acx-ui/rc/components'
import { useGetApCompatibilitiesVenueQuery } from '@acx-ui/rc/services'
import {
  ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY,
  ApCompatibility
} from '@acx-ui/rc/utils'


export const CompatibilityCheck = ({ venueId }: { venueId: string }) => {
  const { $t } = useIntl()
  const [drawerFeature, setDrawerFeature] = useState<boolean>(false)

  const {
    apVenueCompatibilities,
    isLoading
  } = useGetApCompatibilitiesVenueQuery( {
    params: { venueId },
    payload: { filters: {} }
  }, {
    selectFromResult: ({ data, isLoading }) => ({
      apVenueCompatibilities: data?.apCompatibilities[0],
      isLoading
    })
  })

  const toggleCompatibilityDrawer = (open: boolean) => {
    setDrawerFeature(open)
  }

  const incompatibleCount = Number(apVenueCompatibilities?.incompatible)

  return !isLoading && incompatibleCount > 0
    ? <>
      <CompatibleAlertBanner
        title={$t({
          defaultMessage: `{apCount} { apCount, plural,
                  one {access point is}
                  other {access points are}
                } not compatible with certain Wi-Fi & SmartEdge features.`
        },
        {
          apCount: incompatibleCount
        })}
        cacheKey={ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY}
        onClick={() => toggleCompatibilityDrawer(true)}
      />
      {drawerFeature && <EnhancedApCompatibilityDrawer
        visible={true}
        isMultiple
        type={ApCompatibilityType.VENUE}
        venueId={venueId}
        data={apVenueCompatibilities ? [apVenueCompatibilities] : ([] as ApCompatibility[])}
        onClose={() => toggleCompatibilityDrawer(false)}
      />}
    </>
    : null
}
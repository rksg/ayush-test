import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ApGeneralCompatibilityDrawer as EnhancedApCompatibilityDrawer,
  ApCompatibilityType,
  CompatibleAlertBanner } from '@acx-ui/rc/components'
import {
  useGetApCompatibilitiesVenueQuery,
  useGetVenueApCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY,
  ApCompatibility,
  Compatibility,
  IncompatibleFeatureLevelEnum,
  isEdgeCompatibilityFeature
} from '@acx-ui/rc/utils'


const useGetApCompatibilityData = (venueId: string) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  const {
    venueCompatibilities,
    isVenueCompatibilitiesLoading
  } = useGetApCompatibilitiesVenueQuery( {
    params: { venueId },
    payload: { filters: {} }
  }, {
    skip: isApCompatibilitiesByModel,
    selectFromResult: ({ data, isLoading }) => ({
      venueCompatibilities: data?.apCompatibilities[0],
      isVenueCompatibilitiesLoading: isLoading
    })
  })

  const { newVenueCompatibilities, isNewLoading } = useGetVenueApCompatibilitiesQuery({
    params: { venueId },
    payload: {
      filters: {
        venueIds: [ venueId ],
        featureLevels: [IncompatibleFeatureLevelEnum.VENUE]
      },
      page: 1,
      pageSize: 10
    }
  }, {
    skip: !isApCompatibilitiesByModel,
    selectFromResult: ({ data, isLoading }) => ({
      newVenueCompatibilities: data?.compatibilities[0],
      isNewLoading: isLoading
    })
  })

  return isApCompatibilitiesByModel? {
    apVenueCompatibilities: newVenueCompatibilities,
    isLoading: isNewLoading
  } : {
    apVenueCompatibilities: venueCompatibilities,
    isLoading: isVenueCompatibilitiesLoading
  }
}


export const CompatibilityCheck = ({ venueId }: { venueId: string }) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const { $t } = useIntl()

  const [drawerFeature, setDrawerFeature] = useState<boolean>(false)

  const { apVenueCompatibilities, isLoading } = useGetApCompatibilityData(venueId)

  const toggleCompatibilityDrawer = (open: boolean) => {
    setDrawerFeature(open)
  }

  const incompatibleCount = Number(apVenueCompatibilities?.incompatible ?? 0)

  const hasEdgeFeature = apVenueCompatibilities?.incompatibleFeatures
    ?.some(item => isEdgeCompatibilityFeature(item.featureName))

  const emptyData = isApCompatibilitiesByModel? [] as Compatibility[] : [] as ApCompatibility[]

  return !isLoading && incompatibleCount > 0
    ? <>
      <CompatibleAlertBanner
        title={$t({
          defaultMessage: `{apCount} { apCount, plural,
                  one {access point is}
                  other {access points are}
                } not compatible with certain Wi-Fi {edgeText} features.`
        },
        {
          apCount: incompatibleCount,
          edgeText: hasEdgeFeature ? $t({ defaultMessage: '& RUCKUS Edge' }) : ''
        })}
        cacheKey={ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY}
        onClick={() => toggleCompatibilityDrawer(true)}
      />
      {drawerFeature && <EnhancedApCompatibilityDrawer
        visible={true}
        isMultiple
        type={ApCompatibilityType.VENUE}
        venueId={venueId}
        data={apVenueCompatibilities ? [apVenueCompatibilities] : emptyData}
        onClose={() => toggleCompatibilityDrawer(false)}
      />}
    </>
    : null
}
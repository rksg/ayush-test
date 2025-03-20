import { useMemo, useState } from 'react'

import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import {
  ApCompatibilityToolTip,
  ApGeneralCompatibilityDrawer,
  ApCompatibilityType,
  CompatibilityWarningTriangleIcon,
  mergeFilterApCompatibilitiesResultByRequiredFeatures
} from '@acx-ui/rc/components'
import {
  useGetApCompatibilitiesVenueQuery,
  useGetVenueApCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ApCompatibility,
  ApCompatibilityResponse,
  Compatibility,
  CompatibilityResponse,
  IncompatibilityFeatures,
  IncompatibleFeatureLevelEnum,
  edgeSdLanRequiredFeatures
} from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
const SdLanRequiredFeatures = edgeSdLanRequiredFeatures.filter(f => f !== IncompatibilityFeatures.SD_LAN)

const useCompatibilityData = ({ venueId } : { venueId: string }) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  const { dataByModel } = useGetVenueApCompatibilitiesQuery({
    payload: {
      filters: {
        venueIds: [ venueId ],
        featureLevels: [IncompatibleFeatureLevelEnum.VENUE],
        featureNames: edgeSdLanRequiredFeatures
      },
      page: 1,
      pageSize: 10
    }
  }, {
    skip: !isApCompatibilitiesByModel,
    selectFromResult: ({ data }) => {
      if (!data?.compatibilities[0]) {
        return {
          dataByModel: data
        }
      }

      const dataByModel = cloneDeep(data)
      dataByModel.compatibilities[0].incompatibleFeatures?.sort(item =>
        item.featureName === IncompatibilityFeatures.SD_LAN ? -1 : 1)

      return { dataByModel }
    }
  })

  const { data: sdLanIncompatibleData } = useGetApCompatibilitiesVenueQuery({
    params: { venueId },
    payload: { filters: {}, featureName: IncompatibilityFeatures.SD_LAN }
  }, {
    skip: isApCompatibilitiesByModel
  })

  const { data: tunnelProfileIncompatibleData } = useGetApCompatibilitiesVenueQuery({
    params: { venueId },
    payload: { filters: {}, featureName: IncompatibilityFeatures.TUNNEL_PROFILE }
  }, {
    skip: isApCompatibilitiesByModel
  })

  const dataByFamilies = useMemo(() => {
    if (!sdLanIncompatibleData || !tunnelProfileIncompatibleData) return

    const results = [sdLanIncompatibleData, tunnelProfileIncompatibleData]
    const queryfeatures = [IncompatibilityFeatures.SD_LAN, IncompatibilityFeatures.TUNNEL_PROFILE]

    // eslint-disable-next-line max-len
    return { apCompatibilities: [mergeFilterApCompatibilitiesResultByRequiredFeatures(results, queryfeatures)] } as ApCompatibilityResponse
  }, [sdLanIncompatibleData, tunnelProfileIncompatibleData])

  return isApCompatibilitiesByModel ? dataByModel : dataByFamilies
}

// eslint-disable-next-line max-len
export const CompatibilityCheck = ({ venueId, venueName } : { venueId: string, venueName?: string }) => {
  const { $t } = useIntl()
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  const [open, setOpen] = useState<boolean>(false)

  const data = useCompatibilityData({ venueId })

  let isIncompatible: boolean
  let resolvedData: Compatibility[] | ApCompatibility[] | undefined
  if (isApCompatibilitiesByModel) {
    resolvedData = (data as CompatibilityResponse)?.compatibilities
    isIncompatible = Boolean(resolvedData?.[0].incompatible)
  } else {
    resolvedData = (data as ApCompatibilityResponse)?.apCompatibilities
    isIncompatible = Boolean(resolvedData?.[0].incompatible)
    && !!(resolvedData as ApCompatibility[])[0]?.incompatibleFeatures?.[0]?.requiredFw
  }

  return isIncompatible
    ? <>
      <ApCompatibilityToolTip
      // eslint-disable-next-line max-len
        title={$t({ defaultMessage: 'Some APs lower than the minimum firmware version may not setup tunneling.' })}
        showDetailButton
        icon={<CompatibilityWarningTriangleIcon />}
        onClick={() => setOpen(true)}
      />
      {<ApGeneralCompatibilityDrawer
        visible={open}
        type={ApCompatibilityType.VENUE}
        venueId={venueId}
        venueName={venueName}
        featureName={IncompatibilityFeatures.SD_LAN}
        requiredFeatures={SdLanRequiredFeatures}
        isFeatureEnabledRegardless
        data={resolvedData}
        onClose={() => setOpen(false)}
      />}
    </>
    : null
}
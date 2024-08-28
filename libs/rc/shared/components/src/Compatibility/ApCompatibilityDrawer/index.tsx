import { useState, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  useLazyGetApCompatibilitiesVenueQuery,
  useLazyGetApCompatibilitiesNetworkQuery,
  useLazyGetApFeatureSetsQuery
}   from '@acx-ui/rc/services'
import {
  ApCompatibility,
  ApCompatibilityResponse,
  ApIncompatibleFeature,
  isPromiseSettledFulfilled,
  CompatibilityType, IncompatibilityFeatures
} from '@acx-ui/rc/utils'

import { CompatibilityDrawer } from '../CompatibilityDrawer'

export enum ApCompatibilityType {
  NETWORK = 'Network',
  VENUE = 'Venue',
  ALONE = 'ALONE',
}

/**
 * featureName: when specified on a feature
 * requiredFeatures: when `featureName` has other dependency features
 */
export type ApGeneralCompatibilityDrawerProps = {
  visible: boolean,
  type?: ApCompatibilityType,
  isMultiple?: boolean,
  isFeatureEnabledRegardless?: boolean,
  venueId?: string,
  venueName?: string,
  networkId?: string,
  apName?: string,
  featureName?: IncompatibilityFeatures,
  requiredFeatures?: IncompatibilityFeatures[],
  apId?: string,
  data?: ApCompatibility[],
  onClose: () => void
}

export const ApGeneralCompatibilityDrawer = (props: ApGeneralCompatibilityDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    type = ApCompatibilityType.VENUE,
    isMultiple = false,
    featureName,
    requiredFeatures,
    venueId, venueName,
    networkId,
    apName, apId,
    data = [],
    isFeatureEnabledRegardless = false
  } = props

  const [ isInitializing, setIsInitializing ] = useState(data?.length === 0)
  const [ apCompatibilities, setApCompatibilities ] = useState<ApCompatibility[]>(data)
  const [ getApCompatibilitiesVenue ] = useLazyGetApCompatibilitiesVenueQuery()
  const [ getApCompatibilitiesNetwork ] = useLazyGetApCompatibilitiesNetworkQuery()
  const [ getApFeatureSets ] = useLazyGetApFeatureSetsQuery()

  const apNameTitle = (apName) ? `: ${apName}` : ''

  const title = isMultiple
    ? ($t({ defaultMessage: 'Incompatibility Details' }) + apNameTitle)
    : $t({ defaultMessage: 'Compatibility Requirement' })

  const getApCompatibilities = async () => {
    if (ApCompatibilityType.NETWORK === type) {
      return getApCompatibilitiesNetwork({
        params: { networkId },
        payload: {
          filters: {
            ...(apId ? { apIds: [apId] } : undefined),
            ...(venueId ? { venueIds: [venueId] } : undefined)
          },
          featureName
        }
      }).unwrap()

    } else if (ApCompatibilityType.VENUE === type) {
      // eslint-disable-next-line max-len
      const queryfeatures = (featureName ? [featureName].concat(requiredFeatures ?? []) : [undefined])
      const reqs = queryfeatures.map(fName => getApCompatibilitiesVenue({
        params: { venueId },
        payload: {
          filters: {
            ...(apId ? { apIds: [apId] } : undefined),
            ...(networkId ? { networkIds: [networkId] } : undefined)
          },
          ...(isFeatureEnabledRegardless ? { featureName: fName } : undefined)
        }
      }).unwrap())

      const reqResults = await Promise.allSettled(reqs)
      // eslint-disable-next-line max-len
      const results: ApCompatibilityResponse[] = reqResults.filter(isPromiseSettledFulfilled)
        .map(res => res.value as ApCompatibilityResponse)

      return reqs.length > 1
        // eslint-disable-next-line max-len
        ? { apCompatibilities: [mergeAndfilterResultByRequiredFeatures(results, queryfeatures as IncompatibilityFeatures[])] } as ApCompatibilityResponse
        : results[0]
    }

    // feature min requirement info
    const apFeatureSets = await getApFeatureSets({
      params: { featureName: encodeURI(featureName ?? '') }
    }).unwrap()

    // eslint-disable-next-line max-len
    const apIncompatibleFeature = { ...apFeatureSets, incompatibleDevices: [] } as ApIncompatibleFeature
    const apCompatibility = {
      id: 'ApFeatureSet',
      incompatibleFeatures: [apIncompatibleFeature],
      incompatible: 0,
      total: 0
    } as ApCompatibility

    return { apCompatibilities: [apCompatibility] } as ApCompatibilityResponse
  }

  useEffect(() => {
    if (visible && data?.length === 0 && apCompatibilities?.length === 0) {
      const fetchApCompatibilities = async () => {
        try {
          const apCompatibilitiesResponse = await getApCompatibilities()
          setApCompatibilities(apCompatibilitiesResponse?.apCompatibilities ?? [])
          setIsInitializing(false)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('ApCompatibilityDrawer api error:', e)
        }
      }
      fetchApCompatibilities()
    }
  }, [visible, apCompatibilities])

  useEffect(() => {
    if (isInitializing && data?.length !== 0) {
      setIsInitializing(false)
      setApCompatibilities(data)
    }
  }, [data])

  return (
    <CompatibilityDrawer
      data-testid={'ap-compatibility-drawer'}
      visible={visible}
      title={title}
      compatibilityType={apId
        ? CompatibilityType.DEVICE
        : (featureName ? CompatibilityType.FEATURE : CompatibilityType.VENUE)
      }
      data={apCompatibilities}
      onClose={props.onClose}
      isLoading={isInitializing}

      venueId={venueId}
      venueName={venueName}
      featureName={featureName}
    />
  )
}

// eslint-disable-next-line max-len
const mergeAndfilterResultByRequiredFeatures = (results: ApCompatibilityResponse[], requiredFeatures: IncompatibilityFeatures[]): ApCompatibility => {
  const merged = { incompatible: 0 } as ApCompatibility

  const incompatibleFeatures: ApIncompatibleFeature[] = []
  results.forEach(result => {
    const apCompatibility = result.apCompatibilities[0]

    if (merged.incompatible < apCompatibility.incompatible) {
      merged.id = apCompatibility.id
      merged.incompatible = apCompatibility.incompatible
      merged.total = apCompatibility.total
    }

    incompatibleFeatures.push(...((apCompatibility.incompatibleFeatures
      ?.filter(feature =>
        requiredFeatures.includes(feature.featureName as IncompatibilityFeatures)
      )) ?? []))
  })

  merged.incompatibleFeatures = incompatibleFeatures
  return merged
}
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
    data = []
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

  const isFeatureEnabledRegardless = Boolean(apId || networkId)

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
      const queryfeatures = [featureName].concat(requiredFeatures ?? [])
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
        ? { apCompatibilities: filterResultByRequiredFeatures(results, queryfeatures) } as ApCompatibilityResponse
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
const filterResultByRequiredFeatures = (results: ApCompatibilityResponse[], requiredFeatures: IncompatibilityFeatures[]) => {
  const merged: ApCompatibility[] = []

  results.forEach(result => {
    merged.push(...result.apCompatibilities.map(item => ({
      ...item,
      incompatibleFeatures: item.incompatibleFeatures
        ?.filter(feature =>
          requiredFeatures.includes(feature.featureName as IncompatibilityFeatures))
    })))
  })

  return merged
}
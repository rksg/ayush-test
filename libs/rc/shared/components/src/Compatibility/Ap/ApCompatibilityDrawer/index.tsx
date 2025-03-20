/* eslint-disable max-len */
import { useState, useEffect, useCallback, useMemo } from 'react'

import { isNil }   from 'lodash'
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useLazyGetApCompatibilitiesVenueQuery,
  useLazyGetApCompatibilitiesNetworkQuery,
  useLazyGetApFeatureSetsQuery,
  useLazyGetApCompatibilitiesQuery,
  useLazyGetEnhanceApFeatureSetsQuery,
  useLazyGetVenueApCompatibilitiesQuery
}   from '@acx-ui/rc/services'
import {
  ApCompatibility,
  ApCompatibilityResponse,
  ApIncompatibleFeature,
  isPromiseSettledFulfilled,
  CompatibilityType, IncompatibilityFeatures,
  Compatibility,
  IncompatibleFeature,
  CompatibilityResponse,
  IncompatibleFeatureLevelEnum,
  CompatibilitySelectedApInfo
} from '@acx-ui/rc/utils'

import { CompatibilityDrawer }                                  from '../../CompatibilityDrawer'
import { mergeFilterApCompatibilitiesResultByRequiredFeatures } from '../../utils'

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
  featureName?: IncompatibilityFeatures,
  requiredFeatures?: IncompatibilityFeatures[],
  apInfo?: CompatibilitySelectedApInfo,
  data?: ApCompatibility[] | Compatibility[],
  onClose: () => void
}

export const ApGeneralCompatibilityDrawer = (props: ApGeneralCompatibilityDrawerProps) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const { $t } = useIntl()
  const {
    visible,
    isMultiple = false,
    featureName,
    venueId, venueName,
    apInfo
  } = props

  const { name: apName, serialNumber: apId } = apInfo || {}

  const { apCompatibilities: oldCompatibilities, isLoading: isOldLoading } = useApCompatibilityData({ ...props, isSkip: isApCompatibilitiesByModel })
  const { apCompatibilities: newCompatibilities, isLoading: isNewLoading } = useCompatibilityData({ ...props, isSkip: !isApCompatibilitiesByModel })

  const apNameTitle = (apName) ? `: ${apName}` : ''

  const drawerWidth = (isApCompatibilitiesByModel && isMultiple && !apId)? 875 : 595
  const apCompatibilities = isApCompatibilitiesByModel? newCompatibilities : oldCompatibilities
  const isLoading = isApCompatibilitiesByModel? isNewLoading : isOldLoading

  const title = isMultiple
    ? ($t({ defaultMessage: 'Incompatibility Details' }) + apNameTitle)
    : $t({ defaultMessage: 'Compatibility Requirement' })
  return (
    <CompatibilityDrawer
      data-testid={'ap-compatibility-drawer'}
      width={drawerWidth}
      visible={visible}
      title={title}
      compatibilityType={apId
        ? CompatibilityType.DEVICE
        : (featureName ? CompatibilityType.FEATURE : CompatibilityType.VENUE)
      }
      data={apCompatibilities ?? []}
      onClose={props.onClose}
      isLoading={isLoading}

      apInfo={apInfo}
      venueId={venueId}
      venueName={venueName}
      featureName={featureName}
    />
  )
}

// old API
const useApCompatibilityData = (props: (Omit<ApGeneralCompatibilityDrawerProps, 'isMultiple'> & { isSkip: boolean }) ) => {
  const {
    visible,
    type = ApCompatibilityType.VENUE,
    featureName,
    requiredFeatures,
    venueId,
    networkId,
    apInfo,
    data,
    isFeatureEnabledRegardless = false,
    isSkip = false
  } = props

  const { serialNumber: apId } = apInfo || {}

  const [ isInitializing, setIsInitializing ] = useState(false)
  // eslint-disable-next-line max-len
  const [ apCompatibilities, setApCompatibilities ] = useState<ApCompatibility[] | undefined>(undefined)

  const [ getApCompatibilitiesVenue ] = useLazyGetApCompatibilitiesVenueQuery()
  const [ getApCompatibilitiesNetwork ] = useLazyGetApCompatibilitiesNetworkQuery()
  const [ getApFeatureSets ] = useLazyGetApFeatureSetsQuery()

  const getApCompatibilities = useCallback(async () => {
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
        ? { apCompatibilities: [mergeFilterApCompatibilitiesResultByRequiredFeatures(results, queryfeatures as IncompatibilityFeatures[])] } as ApCompatibilityResponse
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
  }, [type, apId, networkId, venueId, featureName, isFeatureEnabledRegardless])

  useEffect(() => {
    // reset data when query payload changed
    setApCompatibilities(undefined)
  }, [type, apId, networkId, venueId, featureName])

  useEffect(() => {
    if (visible && isNil(apCompatibilities) && !isInitializing && !isSkip) {
      if (data?.length) {
        setApCompatibilities(data)
        return
      }

      const fetchApCompatibilities = async () => {
        try {
          setIsInitializing(true)
          const apCompatibilitiesResponse = await getApCompatibilities()
          setApCompatibilities(apCompatibilitiesResponse?.apCompatibilities ?? [])
          setIsInitializing(false)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('ApCompatibilityDrawer api error:', e)
          setIsInitializing(false)
        }
      }

      fetchApCompatibilities()
    }
  }, [visible, data, apCompatibilities, isInitializing, getApCompatibilities, isSkip])

  return useMemo(() => ({ apCompatibilities, isLoading: isInitializing }),
    [apCompatibilities, isInitializing])
}

// new API
const useCompatibilityData = (props: (Omit<ApGeneralCompatibilityDrawerProps, 'isMultiple'> & { isSkip: boolean })) => {
  const {
    visible,
    type = ApCompatibilityType.VENUE,
    featureName,
    venueId,
    networkId,
    apInfo,
    data,
    isFeatureEnabledRegardless = false,
    isSkip = false,
    requiredFeatures
  } = props

  const { serialNumber: apId } = apInfo || {}

  const [ isInitializing, setIsInitializing ] = useState(false)
  // eslint-disable-next-line max-len
  const [ apCompatibilities, setApCompatibilities ] = useState<Compatibility[] | undefined>(undefined)

  const [ getApCompatibilities ] = useLazyGetApCompatibilitiesQuery()
  const [ getVenueApCompatibilities ] = useLazyGetVenueApCompatibilitiesQuery()
  const [ getApFeatureSets ] = useLazyGetEnhanceApFeatureSetsQuery()

  const getCompatibilities = useCallback(async () => {
    if (ApCompatibilityType.NETWORK === type) {
      return getApCompatibilities({
        params: { },
        payload: {
          filters: {
            ...(apId ? { apIds: [apId] } : undefined),
            ...(venueId ? { venueIds: [venueId] } : undefined),
            ...(featureName ? { featureNames: [featureName] } : undefined),
            wifiNetworkIds: [networkId],
            featureLevels: [IncompatibleFeatureLevelEnum.WIFI_NETWORK]
          },
          page: 1,
          pageSize: 10
        }
      }).unwrap()
    } else if (ApCompatibilityType.VENUE === type) {
      const queryfeatureNames = (featureName ? [featureName].concat(requiredFeatures ?? []) : undefined)

      return apId
        ? getApCompatibilities({
          params: { },
          payload: {
            filters: {
              ...(apId ? { apIds: [apId] } : undefined),
              ...(networkId ? { wifiNetworkIds: [networkId] } : undefined),
              ...((isFeatureEnabledRegardless && featureName) ? { featureNames: queryfeatureNames } : undefined),
              venueIds: [venueId],
              featureLevels: [IncompatibleFeatureLevelEnum.VENUE]
            },
            page: 1,
            pageSize: 10
          }
        }).unwrap()
        : getVenueApCompatibilities({
          params: { venueId },
          payload: {
            filters: {
              venueIds: [ venueId ],
              featureLevels: [IncompatibleFeatureLevelEnum.VENUE]
            },
            page: 1,
            pageSize: 10
          } }).unwrap()
    }

    // feature min requirement info
    const apFeatureSetsResponse = await getApFeatureSets({
      params: {},
      payload: {
        filters: {
          featureNames: [featureName]
        },
        page: 1,
        pageSize: 10
      }
    }).unwrap()
    const apFeatureSets = apFeatureSetsResponse.featureSets
    const apIncompatibleFeatures = apFeatureSets.map((featureSet) => {
      return {
        ...featureSet,
        incompatibleDevices: []
      } as IncompatibleFeature
    })

    const compatibility = {
      id: 'ApFeatureSet',
      incompatibleFeatures: apIncompatibleFeatures,
      incompatible: 0,
      total: 0
    } as Compatibility
    return { compatibilities: [compatibility] } as CompatibilityResponse
  }, [type, apId, networkId, venueId, featureName, isFeatureEnabledRegardless])

  useEffect(() => {
    // reset data when query payload changed
    setApCompatibilities(undefined)
  }, [type, apId, networkId, venueId, featureName])

  useEffect(() => {
    if (visible && isNil(apCompatibilities) && !isInitializing && !isSkip) {
      if (data?.length) {
        setApCompatibilities(data)
        return
      }

      const fetchApCompatibilities = async () => {
        try {
          setIsInitializing(true)
          const apCompatibilitiesResponse = await getCompatibilities()
          setApCompatibilities(apCompatibilitiesResponse?.compatibilities ?? [])
          setIsInitializing(false)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('ApCompatibilityDrawer api error:', e)
          setIsInitializing(false)
        }
      }

      fetchApCompatibilities()
    }
  }, [visible, data, apCompatibilities, isInitializing, getApCompatibilities, isSkip])

  return useMemo(() => ({ apCompatibilities, isLoading: isInitializing }),
    [apCompatibilities, isInitializing])
}
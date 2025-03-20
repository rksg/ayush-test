/* eslint-disable max-len */
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TypedUseLazyQuery } from '@reduxjs/toolkit/query/react'
import { get, isNil }        from 'lodash'

import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import {
  useLazyGetApFeatureSetsQuery,
  useLazyGetDhcpEdgeCompatibilitiesQuery,
  useLazyGetDhcpEdgeCompatibilitiesV1_1Query,
  useLazyGetEdgeFeatureSetsQuery,
  useLazyGetEdgeFeatureSetsV1_1Query,
  useLazyGetEnhanceApFeatureSetsQuery,
  useLazyGetHqosEdgeCompatibilitiesQuery,
  useLazyGetHqosEdgeCompatibilitiesV1_1Query,
  useLazyGetMdnsEdgeCompatibilitiesQuery,
  useLazyGetMdnsEdgeCompatibilitiesV1_1Query,
  useLazyGetPinApCompatibilitiesQuery,
  useLazyGetPinEdgeCompatibilitiesQuery,
  useLazyGetPinEdgeCompatibilitiesV1_1Query,
  useLazyGetSdLanApCompatibilitiesDeprecatedQuery,
  useLazyGetSdLanApCompatibilitiesQuery,
  useLazyGetSdLanEdgeCompatibilitiesQuery,
  useLazyGetSdLanEdgeCompatibilitiesV1_1Query,
  useLazyGetSwitchFeatureSetsQuery,
  useLazyGetVenueEdgeCompatibilitiesQuery,
  useLazyGetVenueEdgeCompatibilitiesV1_1Query
} from '@acx-ui/rc/services'
import {
  ApCompatibility,
  ApIncompatibleDevice,
  ApIncompatibleFeature,
  Compatibility,
  CompatibilityDeviceEnum,
  EdgeFeatureDetailsV1_1,
  EdgeFeatureRequirement,
  EdgeSdLanApCompatibilitiesResponse,
  EdgeSdLanApCompatibility,
  EdgeServiceApCompatibility,
  EdgeServiceCompatibilitiesResponse,
  EdgeServiceCompatibilitiesResponseV1_1,
  EdgeServiceCompatibility,
  EdgeServiceCompatibilityV1_1,
  EdgeServicesApCompatibilitiesResponse,
  EntityCompatibility,
  EntityCompatibilityV1_1,
  getFeaturesIncompatibleDetailData,
  IncompatibilityFeatures,
  isApRelatedEdgeFeature,
  isSwitchRelatedEdgeFeature
} from '@acx-ui/rc/utils'

import { EdgeCompatibilityDrawerProps, EdgeCompatibilityType } from '../Compatibility/Edge/EdgeCompatibilityDrawer'

import { useIsEdgeFeatureReady } from '.'

export const useEdgeSdLansCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: serviceIds,
    skip: skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetSdLanEdgeCompatibilitiesV1_1Query : useLazyGetSdLanEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: isApCompatibilitiesByModel ? useLazyGetSdLanApCompatibilitiesQuery : useLazyGetSdLanApCompatibilitiesDeprecatedQuery
  })
  return results as {
    compatibilities: Record<string, EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[]> | undefined
    isLoading: boolean
  }
}

export const useEdgePinsCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: serviceIds,
    skip: skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled? useLazyGetPinEdgeCompatibilitiesV1_1Query : useLazyGetPinEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: isApCompatibilitiesByModel ? useLazyGetPinApCompatibilitiesQuery : undefined
  })
  return results as {
    compatibilities: Record<string, EdgeServiceCompatibility[] | EdgeServiceApCompatibility[]> | undefined
    isLoading: boolean
  }
}

export const useEdgeMdnssCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: serviceIds,
    skip: skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetMdnsEdgeCompatibilitiesV1_1Query : useLazyGetMdnsEdgeCompatibilitiesQuery
  })
  return results as {
    compatibilities: Record<string, EdgeServiceCompatibility[]> | undefined
    isLoading: boolean
  }
}

export const useEdgeHqosCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: serviceIds,
    skip: skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetHqosEdgeCompatibilitiesV1_1Query : useLazyGetHqosEdgeCompatibilitiesQuery
  })
  return results as {
    compatibilities: Record<string, EdgeServiceCompatibility[]> | undefined
    isLoading: boolean
  }
}

export const useEdgeDhcpCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: serviceIds,
    skip: skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetDhcpEdgeCompatibilitiesV1_1Query : useLazyGetDhcpEdgeCompatibilitiesQuery
  })
  return results as {
    compatibilities: Record<string, EdgeServiceCompatibility[]> | undefined
    isLoading: boolean
  }
}

export const useEdgeSdLanDetailsCompatibilitiesData = (props: {
  serviceId: string,
  skip?: boolean,
}) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: props.serviceId,
    skip: props.skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetSdLanEdgeCompatibilitiesV1_1Query : useLazyGetSdLanEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: isApCompatibilitiesByModel ? useLazyGetSdLanApCompatibilitiesQuery : useLazyGetSdLanApCompatibilitiesDeprecatedQuery
  })

  const transformed: Record<string, Record<string, ApCompatibility>> = {}
  if (isNil(results.compatibilities)) return { compatibilities: transformed, isLoading: results.isLoading }

  Object.entries(results.compatibilities).forEach(([deviceType, compatibilities]) => {
    if(deviceType === CompatibilityDeviceEnum.EDGE) {
      const details = getFeaturesIncompatibleDetailData((isEdgeCompatibilityEnhancementEnabled ? compatibilities as EdgeServiceCompatibilityV1_1[] : compatibilities as EdgeServiceCompatibility[])[0])
      transformed[CompatibilityDeviceEnum.EDGE] = details
    } else if (deviceType === CompatibilityDeviceEnum.AP) {
      const details = getFeaturesIncompatibleDetailData((compatibilities as EdgeSdLanApCompatibility[])[0])
      transformed[CompatibilityDeviceEnum.AP] = details
    }
  })

  return { compatibilities: transformed, isLoading: results.isLoading }
}

export const useEdgePinDetailsCompatibilitiesData = (props: {
  serviceId: string,
  skip?: boolean,
}) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: props.serviceId,
    skip: props.skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetPinEdgeCompatibilitiesV1_1Query : useLazyGetPinEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: isApCompatibilitiesByModel ? useLazyGetPinApCompatibilitiesQuery : undefined
  })

  const transformed: Record<string, Record<string, ApCompatibility>> = {}
  if (isNil(results.compatibilities)) return { compatibilities: transformed, isLoading: results.isLoading }

  Object.entries(results.compatibilities).forEach(([deviceType, compatibilities]) => {
    if(deviceType === CompatibilityDeviceEnum.EDGE) {
      const details = getFeaturesIncompatibleDetailData((isEdgeCompatibilityEnhancementEnabled ? compatibilities as EdgeServiceCompatibilityV1_1[] : compatibilities as EdgeServiceCompatibility[])[0])
      transformed[CompatibilityDeviceEnum.EDGE] = details
    } else if (deviceType === CompatibilityDeviceEnum.AP) {
      const details = getFeaturesIncompatibleDetailData((compatibilities as EdgeServiceApCompatibility[])[0])
      transformed[CompatibilityDeviceEnum.AP] = details
    }
  })

  return { compatibilities: transformed, isLoading: results.isLoading }
}

export const useEdgeMdnsDetailsCompatibilitiesData = (props: {
  serviceId: string,
  skip?: boolean,
}) => {
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: props.serviceId,
    skip: props.skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetMdnsEdgeCompatibilitiesV1_1Query : useLazyGetMdnsEdgeCompatibilitiesQuery
  })

  let transformed: Record<string, ApCompatibility> = {}
  if (isNil(results.compatibilities)) return { compatibilities: transformed, isLoading: results.isLoading }
  transformed = getFeaturesIncompatibleDetailData((results.compatibilities[CompatibilityDeviceEnum.EDGE] as EdgeServiceCompatibility[])[0])

  return { compatibilities: transformed, isLoading: results.isLoading }
}

export const useEdgeHqosDetailsCompatibilitiesData = (props: {
  serviceId: string,
  skip?: boolean,
}) => {
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: props.serviceId,
    skip: props.skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetHqosEdgeCompatibilitiesV1_1Query : useLazyGetHqosEdgeCompatibilitiesQuery
  })

  let transformed: Record<string, ApCompatibility> = {}
  if (isNil(results.compatibilities)) return { compatibilities: transformed, isLoading: results.isLoading }
  transformed = getFeaturesIncompatibleDetailData((results.compatibilities[CompatibilityDeviceEnum.EDGE] as EdgeServiceCompatibility[])[0])

  return { compatibilities: transformed, isLoading: results.isLoading }
}

export const useEdgeDhcpDetailsCompatibilitiesData = (props: {
  serviceId: string,
  skip?: boolean,
}) => {
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: props.serviceId,
    skip: props.skip,
    useEdgeSvcPcyCompatibleQuery: isEdgeCompatibilityEnhancementEnabled ? useLazyGetDhcpEdgeCompatibilitiesV1_1Query : useLazyGetDhcpEdgeCompatibilitiesQuery
  })

  let transformed: Record<string, ApCompatibility> = {}
  if (isNil(results.compatibilities)) return { compatibilities: transformed, isLoading: results.isLoading }
  transformed = getFeaturesIncompatibleDetailData((results.compatibilities[CompatibilityDeviceEnum.EDGE] as EdgeServiceCompatibility[])[0])

  return { compatibilities: transformed, isLoading: results.isLoading }
}


// services / policies
export const useEdgeSvcsPcysCompatibilitiesData = (props: {
  serviceIds: string[] | string,
  skip?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEdgeSvcPcyCompatibleQuery: TypedUseLazyQuery<EdgeServiceCompatibilitiesResponseV1_1, any, any> | TypedUseLazyQuery<EdgeServiceCompatibilitiesResponse, any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEdgeSvcPcyApCompatibleQuery?: TypedUseLazyQuery<EdgeServicesApCompatibilitiesResponse, any, any> | TypedUseLazyQuery<EdgeSdLanApCompatibilitiesResponse, any, any> | undefined
})=> {
  const { serviceIds, skip = false, useEdgeSvcPcyCompatibleQuery, useEdgeSvcPcyApCompatibleQuery } = props
  const [ isInitializing, setIsInitializing ] = useState(false)
  const [data, setData] = useState<Record<string, EdgeServiceCompatibilityV1_1[] | EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[] | EdgeServiceApCompatibility[]> | undefined>(undefined)

  const [getEdgeSvcPcyCompatibilities] = useEdgeSvcPcyCompatibleQuery()
  const apCompatibilityFn = useEdgeSvcPcyApCompatibleQuery?.()

  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const fetchEdgeCompatibilities = useCallback(async (ids: string[]) => {
    try {
      setIsInitializing(true)

      const reqs: unknown[] = [getEdgeSvcPcyCompatibilities({ payload: { filters: { serviceIds: ids } } }).unwrap()]
      if (apCompatibilityFn) {
        reqs.push(apCompatibilityFn[0]({ payload: { filters: { serviceIds: ids } } }).unwrap())
      }

      const deviceTypeResultMap: Record<string, EdgeServiceCompatibilityV1_1[] | EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[] | EdgeServiceApCompatibility[]> = {}
      const results = await Promise.allSettled(reqs)
      results.forEach((resultItem, index) => {
        if (resultItem.status === 'fulfilled') {
          if(index === 0) {
            deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = (isEdgeCompatibilityEnhancementEnabled
              ? resultItem.value as EdgeServiceCompatibilitiesResponseV1_1 : resultItem.value as EdgeServiceCompatibilitiesResponse)?.compatibilities ?? []
          } else {
            deviceTypeResultMap[CompatibilityDeviceEnum.AP] = (resultItem.value as EdgeSdLanApCompatibilitiesResponse)?.compatibilities ?? []
          }
        }
      })

      setData(deviceTypeResultMap)
      setIsInitializing(false)
    } catch(e) {
      // eslint-disable-next-line no-console
      console.error('EdgeCompatibilityDrawer api error:', e)
      setIsInitializing(false)
    }
  }, [apCompatibilityFn, getEdgeSvcPcyCompatibilities])

  useEffect(() => {
    if (!skip && serviceIds.length) {
      const usedIds = Array.isArray(serviceIds) ? serviceIds : [serviceIds]
      fetchEdgeCompatibilities(usedIds)
    }
  }, [serviceIds, skip])


  return useMemo(() => ({ compatibilities: data, isLoading: isInitializing }),
    [data, isInitializing])
}

export const transformEdgeCompatibilitiesWithFeatureName = (compatibilities: Record<string, Record<string, ApCompatibility>>, featureName: string) => {
  const edgeData = get(compatibilities, [CompatibilityDeviceEnum.EDGE, featureName])
  const apData = get(compatibilities, [CompatibilityDeviceEnum.AP, featureName])
  const result = {} as Record<string, ApCompatibility>
  if (edgeData) result[CompatibilityDeviceEnum.EDGE] = edgeData
  if (apData) result[CompatibilityDeviceEnum.AP] = apData

  return result
}

export const useEdgeCompatibilityRequirementData = (featureName: IncompatibilityFeatures, skip: boolean = false) => {
  const [ isInitializing, setIsInitializing ] = useState(false)
  const [ data, setData ] = useState<Record<string, ApCompatibility | Compatibility>>({})
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const [ getEdgeFeatureSets ] = useLazyGetEdgeFeatureSetsQuery()
  const [ getEdgeFeatureSetsV1_1 ] = useLazyGetEdgeFeatureSetsV1_1Query()
  const [ getSwitchFeatureSets ] = useLazyGetSwitchFeatureSetsQuery()
  const [ getApFeatureSets ] = useLazyGetApFeatureSetsQuery()
  const [ getEnhanceApFeatureSets ] = useLazyGetEnhanceApFeatureSetsQuery()

  const fetchEdgeCompatibilities = useCallback(async () => {
    try {
      setIsInitializing(true)

      const deviceTypeResultMap: Record<string, ApCompatibility | Compatibility> = {}

      const edgeFeatureSetsPayload = { filters: { featureNames: [featureName] } }
      const edgeFeatures = isEdgeCompatibilityEnhancementEnabled
        ? await getEdgeFeatureSetsV1_1({ payload: edgeFeatureSetsPayload }, true).unwrap()
        : await getEdgeFeatureSets({ payload: edgeFeatureSetsPayload }, true).unwrap()

      deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = isEdgeCompatibilityEnhancementEnabled
        ? {
          id: 'edge_feature_requirements',
          incompatibleFeatures: edgeFeatures.featureSets as EdgeFeatureDetailsV1_1[],
          incompatible: 0,
          total: 0 } as Compatibility
        : {
          id: 'edge_feature_requirements',
          incompatibleFeatures: edgeFeatures.featureSets as EdgeFeatureRequirement[],
          incompatible: 0,
          total: 0 } as ApCompatibility

      if (isSwitchRelatedEdgeFeature(featureName)) {
        const switchFeature = await getSwitchFeatureSets({
          payload: { filter: { featureNames: { field: 'GROUP', values: ['PIN'] } } }
        }, true).unwrap()
        deviceTypeResultMap[CompatibilityDeviceEnum.SWITCH] = {
          id: 'switch_feature_requirements',
          incompatibleFeatures: switchFeature.featureSets,
          incompatible: 0,
          total: 0
        } as ApCompatibility
      }

      if (isApRelatedEdgeFeature(featureName)) {
        if (isApCompatibilitiesByModel) {
          const apFeatureSetsResponse = await getEnhanceApFeatureSets({
            params: {},
            payload: {
              filters: {
                featureNames: [featureName]
              },
              page: 1,
              pageSize: 10
            }
          }, true).unwrap()

          deviceTypeResultMap[CompatibilityDeviceEnum.AP] = {
            id: 'wifi_feature_requirements',
            incompatibleFeatures: apFeatureSetsResponse.featureSets,
            incompatible: 0,
            total: 0
          } as Compatibility
        } else {
          const wifiFeature = await getApFeatureSets({
            params: { featureName: encodeURI(featureName) }
          }, true).unwrap()

          deviceTypeResultMap[CompatibilityDeviceEnum.AP] = {
            id: 'wifi_feature_requirements',
            incompatibleFeatures: [wifiFeature],
            incompatible: 0,
            total: 0
          } as ApCompatibility
        }
      }

      setData(deviceTypeResultMap)
      setIsInitializing(false)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('EdgeCompatibilityDrawer api error:', e)
      setIsInitializing(false)
    }
  }, [featureName, getApFeatureSets, getEdgeFeatureSets, getEdgeFeatureSetsV1_1, getSwitchFeatureSets])

  useEffect(() => {
    if (!skip)
      fetchEdgeCompatibilities()
  }, [skip, fetchEdgeCompatibilities])

  return useMemo(() => ({ featureInfos: data, isLoading: isInitializing }),
    [data, isInitializing])
}

// eslint-disable-next-line max-len
export const useVenueEdgeCompatibilitiesData = (props: EdgeCompatibilityDrawerProps, skip: boolean = false) => {
  const { data, type = EdgeCompatibilityType.VENUE, featureName, venueId, edgeId } = props
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const [ isInitializing, setIsInitializing ] = useState<boolean>(false)
  // eslint-disable-next-line max-len
  const [ edgeCompatibilities, setEdgeCompatibilities ] = useState<ApCompatibility[] | Compatibility[] | undefined>(undefined)

  const [getEdgeFeatureSets] = useLazyGetEdgeFeatureSetsQuery()
  const [getVenueEdgeCompatibilities] = useLazyGetVenueEdgeCompatibilitiesQuery()
  const [getVenueEdgeCompatibilitiesV1_1] = useLazyGetVenueEdgeCompatibilitiesV1_1Query()

  const getEdgeCompatibilities = useCallback(async () => {
    try {
      setIsInitializing(true)

      const featureNames = featureName ? [featureName] : []
      let edgeCompatibilitiesResponse: ApCompatibility[] | Compatibility[] = []

      // eslint-disable-next-line max-len
      if ((type === EdgeCompatibilityType.VENUE || type === EdgeCompatibilityType.DEVICE) && data?.length) {
        edgeCompatibilitiesResponse = isEdgeCompatibilityEnhancementEnabled
          ? edgeDataToCompatibilityData(data as EntityCompatibilityV1_1[])
          : edgeDataToApCompatibilityData(data as EntityCompatibility[])
        setEdgeCompatibilities(edgeCompatibilitiesResponse)
        setIsInitializing(false)
        return
      }

      if (type === EdgeCompatibilityType.VENUE || type === EdgeCompatibilityType.DEVICE) {
        const payload = {
          filters: {
            ...(venueId ? { venueIds: [venueId] } : undefined),
            ...(edgeId ? { edgeIds: [edgeId] } : undefined)
          }
        }
        const venueEdgeCompatibilities = isEdgeCompatibilityEnhancementEnabled
          ? await getVenueEdgeCompatibilitiesV1_1({ payload: payload }).unwrap()
          : await getVenueEdgeCompatibilities({ payload: payload }).unwrap()

        // eslint-disable-next-line max-len
        edgeCompatibilitiesResponse = isEdgeCompatibilityEnhancementEnabled
          ? edgeDataToCompatibilityData(venueEdgeCompatibilities?.compatibilities as EntityCompatibilityV1_1[] ?? [])
          : edgeDataToApCompatibilityData(venueEdgeCompatibilities.compatibilities as EntityCompatibility[] ?? [])
      } else if (type === EdgeCompatibilityType.ALONE) {
        const edgeFeatureSets = await getEdgeFeatureSets({
          payload: { filters: { featureNames } }
        }, true).unwrap()

        edgeCompatibilitiesResponse = edgeFeatureSets.featureSets.map(item => {
          return {
            id: `EdgeFeature_${item.featureName}`,
            incompatibleFeatures: [
              { ...item, incompatibleDevices: [] } as ApIncompatibleFeature
            ],
            incompatible: 0,
            total: 0
          } as ApCompatibility
        })
      }

      setEdgeCompatibilities(edgeCompatibilitiesResponse)
      setIsInitializing(false)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('EdgeCompatibilityDrawer api error:', e)
      setIsInitializing(false)
    }
  }, [data, edgeId, featureName, type, venueId])

  useEffect(() => {
    // reset data
    setEdgeCompatibilities(undefined)
  }, [type, edgeId, venueId, featureName])

  useEffect(() => {
    if (!skip && isNil(edgeCompatibilities)&& !isInitializing) {

      const fetchEdgeCompatibilities = async () => {
        try {
          await getEdgeCompatibilities()
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('ApCompatibilityDrawer api error:', e)
          setIsInitializing(false)
        }
      }

      fetchEdgeCompatibilities()
    }
  }, [skip, data, edgeCompatibilities, isInitializing, getEdgeCompatibilities])

  return useMemo(() => ({ edgeCompatibilities, isLoading: isInitializing }),
    [edgeCompatibilities, isInitializing])
}

const edgeDataToApCompatibilityData = (data: EntityCompatibility[]): ApCompatibility[] => {
  return data.map(item => ({
    id: item.id,
    total: item.total,
    incompatible: item.incompatible,
    incompatibleFeatures: item.incompatibleFeatures?.map(incompatibleFeature => ({
      featureName: incompatibleFeature.featureRequirement.featureName,
      requiredFw: incompatibleFeature.featureRequirement.requiredFw,
      incompatibleDevices: incompatibleFeature.incompatibleDevices as ApIncompatibleDevice[]
    } as ApIncompatibleFeature))
  } as ApCompatibility))
}

const edgeDataToCompatibilityData = (data: EntityCompatibilityV1_1[]): Compatibility[] => {
  return data.map(item => ({
    id: item.id,
    total: item.total,
    incompatible: item.incompatible,
    incompatibleFeatures: item.incompatibleFeatures
  } as Compatibility))
}
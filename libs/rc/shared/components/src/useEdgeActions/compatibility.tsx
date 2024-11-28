/* eslint-disable max-len */
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TypedUseLazyQuery } from '@reduxjs/toolkit/query/react'
import { get, isNil }        from 'lodash'

import { useIsSplitOn, Features }           from '@acx-ui/feature-toggle'
import {
  useLazyGetApFeatureSetsQuery,
  useLazyGetEdgeFeatureSetsQuery,
  useLazyGetMdnsEdgeCompatibilitiesQuery,
  useLazyGetPinApCompatibilitiesQuery,
  useLazyGetPinEdgeCompatibilitiesQuery,
  useLazyGetSdLanApCompatibilitiesQuery,
  useLazyGetSdLanEdgeCompatibilitiesQuery,
  useLazyGetSwitchFeatureSetsQuery,
  useLazyGetVenueEdgeCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ApCompatibility,
  ApIncompatibleDevice,
  ApIncompatibleFeature,
  CompatibilityDeviceEnum,
  EdgeSdLanApCompatibilitiesResponse,
  EdgeSdLanApCompatibility,
  EdgeServiceApCompatibility,
  EdgeServiceCompatibilitiesResponse,
  EdgeServiceCompatibility,
  EdgeServicesApCompatibilitiesResponse,
  EntityCompatibility,
  getFeaturesIncompatibleDetailData,
  IncompatibilityFeatures,
  isApRelatedEdgeFeature,
  isSwitchRelatedEdgeFeature
} from '@acx-ui/rc/utils'

import { EdgeCompatibilityDrawerProps, EdgeCompatibilityType } from '../Compatibility/EdgeCompatibilityDrawer'

export const useEdgeSdLansCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: serviceIds,
    skip: skip,
    useEdgeSvcPcyCompatibleQuery: useLazyGetSdLanEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: useLazyGetSdLanApCompatibilitiesQuery
  })
  return results as {
    compatibilities: Record<string, EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[]> | undefined
    isLoading: boolean
  }
}

export const useEdgePinsCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: serviceIds,
    skip: skip,
    useEdgeSvcPcyCompatibleQuery: useLazyGetPinEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: isApCompatibilitiesByModel ? useLazyGetPinApCompatibilitiesQuery : undefined
  })
  return results as {
    compatibilities: Record<string, EdgeServiceCompatibility[] | EdgeServiceApCompatibility[]> | undefined
    isLoading: boolean
  }
}

export const useEdgeMdnssCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: serviceIds,
    skip: skip,
    useEdgeSvcPcyCompatibleQuery: useLazyGetMdnsEdgeCompatibilitiesQuery
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
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: props.serviceId,
    skip: props.skip,
    useEdgeSvcPcyCompatibleQuery: useLazyGetSdLanEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: useLazyGetSdLanApCompatibilitiesQuery
  })

  const transformed: Record<string, Record<string, ApCompatibility>> = {}
  if (isNil(results.compatibilities)) return { compatibilities: transformed, isLoading: results.isLoading }

  Object.entries(results.compatibilities).forEach(([deviceType, compatibilities]) => {
    if(deviceType === CompatibilityDeviceEnum.EDGE) {
      const details = getFeaturesIncompatibleDetailData((compatibilities as EdgeServiceCompatibility[])[0])
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

  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: props.serviceId,
    skip: props.skip,
    useEdgeSvcPcyCompatibleQuery: useLazyGetPinEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: isApCompatibilitiesByModel ? useLazyGetPinApCompatibilitiesQuery : undefined
  })

  const transformed: Record<string, Record<string, ApCompatibility>> = {}
  if (isNil(results.compatibilities)) return { compatibilities: transformed, isLoading: results.isLoading }

  Object.entries(results.compatibilities).forEach(([deviceType, compatibilities]) => {
    if(deviceType === CompatibilityDeviceEnum.EDGE) {
      const details = getFeaturesIncompatibleDetailData((compatibilities as EdgeServiceCompatibility[])[0])
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
  const results = useEdgeSvcsPcysCompatibilitiesData({
    serviceIds: props.serviceId,
    skip: props.skip,
    useEdgeSvcPcyCompatibleQuery: useLazyGetMdnsEdgeCompatibilitiesQuery
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
  useEdgeSvcPcyCompatibleQuery: TypedUseLazyQuery<EdgeServiceCompatibilitiesResponse, any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEdgeSvcPcyApCompatibleQuery?: TypedUseLazyQuery<EdgeServicesApCompatibilitiesResponse, any, any> | TypedUseLazyQuery<EdgeSdLanApCompatibilitiesResponse, any, any> | undefined
})=> {
  const { serviceIds, skip = false, useEdgeSvcPcyCompatibleQuery, useEdgeSvcPcyApCompatibleQuery } = props
  const [ isInitializing, setIsInitializing ] = useState(false)
  const [data, setData] = useState<Record<string, EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[] | EdgeServiceApCompatibility[]> | undefined>(undefined)

  const [getEdgeSvcPcyCompatibilities] = useEdgeSvcPcyCompatibleQuery()
  const apCompatibilityFn = useEdgeSvcPcyApCompatibleQuery?.()

  const fetchEdgeCompatibilities = async (ids: string[]) => {
    try {
      setIsInitializing(true)

      const reqs: unknown[] = [getEdgeSvcPcyCompatibilities({ payload: { filters: { serviceIds: ids } } }).unwrap()]
      if (apCompatibilityFn) {
        reqs.push(apCompatibilityFn[0]({ payload: { filters: { serviceIds: ids } } }).unwrap())
      }

      const deviceTypeResultMap: Record<string, EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[] | EdgeServiceApCompatibility[]> = {}
      const results = await Promise.allSettled(reqs)
      results.forEach((resultItem, index) => {
        if (resultItem.status === 'fulfilled') {
          if(index === 0) {
            deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = (resultItem.value as EdgeServiceCompatibilitiesResponse)?.compatibilities ?? []
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
  }

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
  const [ data, setData ] = useState<Record<string, ApCompatibility>>({})

  const [ getEdgeFeatureSets ] = useLazyGetEdgeFeatureSetsQuery()
  const [ getSwitchFeatureSets ] = useLazyGetSwitchFeatureSetsQuery()
  const [ getApFeatureSets ] = useLazyGetApFeatureSetsQuery()

  const fetchEdgeCompatibilities = useCallback(async () => {
    try {
      setIsInitializing(true)

      const deviceTypeResultMap: Record<string, ApCompatibility> = {}

      const edgeFeatures = await getEdgeFeatureSets({
        payload: { filters: { featureNames: [featureName] } }
      }).unwrap()

      deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = {
        id: 'edge_feature_requirements',
        incompatibleFeatures: edgeFeatures.featureSets,
        incompatible: 0,
        total: 0
      } as ApCompatibility

      if (isSwitchRelatedEdgeFeature(featureName)) {
        const switchFeature = await getSwitchFeatureSets({
          payload: { filter: { featureNames: { field: 'GROUP', values: ['PIN'] } } }
        }).unwrap()
        deviceTypeResultMap[CompatibilityDeviceEnum.SWITCH] = {
          id: 'switch_feature_requirements',
          incompatibleFeatures: switchFeature.featureSets,
          incompatible: 0,
          total: 0
        } as ApCompatibility
      }

      if (isApRelatedEdgeFeature(featureName)) {
        const wifiFeature = await getApFeatureSets({
          params: { featureName: encodeURI(featureName) }
        }).unwrap()
        deviceTypeResultMap[CompatibilityDeviceEnum.AP] = {
          id: 'wifi_feature_requirements',
          incompatibleFeatures: [wifiFeature],
          incompatible: 0,
          total: 0
        } as ApCompatibility
      }

      setData(deviceTypeResultMap)
      setIsInitializing(false)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('EdgeCompatibilityDrawer api error:', e)
      setIsInitializing(false)
    }
  }, [featureName, getApFeatureSets, getEdgeFeatureSets, getSwitchFeatureSets])

  useEffect(() => {
    if (!skip)
      fetchEdgeCompatibilities()
  }, [fetchEdgeCompatibilities, skip])

  return useMemo(() => ({ featureInfos: data, isLoading: isInitializing }),
    [data, isInitializing])
}

export const useVenueEdgeCompatibilitiesData = (props: Omit<EdgeCompatibilityDrawerProps, 'visible'|'title'| 'onClose'>, skip: boolean = false) => {
  const { data, type = EdgeCompatibilityType.VENUE, featureName, venueId, edgeId } = props
  const [ isInitializing, setIsInitializing ] = useState(data?.length === 0)
  const [ edgeCompatibilities, setEdgeCompatibilities ] = useState<ApCompatibility[]>([])

  const [getEdgeFeatureSets] = useLazyGetEdgeFeatureSetsQuery()
  const [getVenueEdgeCompatibilities] = useLazyGetVenueEdgeCompatibilitiesQuery()

  const fetchEdgeCompatibilities = async () => {
    try {
      const featureNames = [featureName] ?? []
      let edgeCompatibilitiesResponse: ApCompatibility[] = []

      if (type === EdgeCompatibilityType.VENUE) {
        const venueEdgeCompatibilities = await getVenueEdgeCompatibilities({ payload: {
          filters: {
            ...(venueId ? { venueIds: [venueId] } : undefined),
            ...(edgeId ? { edgeIds: [edgeId] } : undefined)
          } }
        }).unwrap()

        edgeCompatibilitiesResponse = sdLanToApCompatibilityData(venueEdgeCompatibilities.compatibilities ?? [])
      } else if (type === EdgeCompatibilityType.ALONE) {
        const edgeFeatureSets = await getEdgeFeatureSets({
          payload: { filters: { featureNames } }
        }).unwrap()

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
  }

  useEffect(() => {
    if (!skip)
      fetchEdgeCompatibilities()
  }, [skip])

  return useMemo(() => ({ edgeCompatibilities, isLoading: isInitializing }),
    [edgeCompatibilities, isInitializing])
}

const sdLanToApCompatibilityData = (data: EntityCompatibility[]): ApCompatibility[] => {
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

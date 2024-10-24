/* eslint-disable max-len */
import { useEffect, useMemo, useState } from 'react'

import { UseLazyQuery }    from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { QueryDefinition } from '@reduxjs/toolkit/query'
import { get }             from 'lodash'

import {
  useLazyGetApFeatureSetsQuery,
  useLazyGetEdgeFeatureSetsQuery,
  // TODO: add back after BE code deploy
  // useLazyGetPinApCompatibilitiesQuery,
  useLazyGetPinEdgeCompatibilitiesQuery,
  useLazyGetSdLanApCompatibilitiesQuery,
  useLazyGetSdLanEdgeCompatibilitiesQuery,
  useLazyGetVenueEdgeCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ApCompatibility,
  ApIncompatibleDevice,
  ApIncompatibleFeature,
  CompatibilityDeviceEnum,
  EdgeSdLanApCompatibilitiesResponse,
  EdgeSdLanApCompatibility,
  EdgeServiceCompatibilitiesResponse,
  EdgeServiceCompatibility,
  EdgeServicesApCompatibilitiesResponse,
  EntityCompatibility,
  getFeaturesIncompatibleDetailData,
  IncompatibilityFeatures,
  isApRelatedEdgeFeature
} from '@acx-ui/rc/utils'

import { EdgeCompatibilityDrawerProps, EdgeCompatibilityType } from '../Compatibility/EdgeCompatibilityDrawer'

// SDLAN table
export const useEdgeSdLanCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  const [data, setData] = useState<Record<string, EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[]> | undefined>(undefined)

  const [getSdLanEdgeCompatibilities] = useLazyGetSdLanEdgeCompatibilitiesQuery()
  const [getSdLanApCompatibilities] = useLazyGetSdLanApCompatibilitiesQuery()

  const fetchEdgeCompatibilities = async (ids: string[]) => {
    try {
      const result = await Promise.allSettled([
        getSdLanEdgeCompatibilities({ payload: { filters: { serviceIds: ids } } }).unwrap(),
        getSdLanApCompatibilities({ payload: { filters: { serviceIds: ids } } }).unwrap()
      ])

      const deviceTypeResultMap: Record<string, EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[]> = {}
      result.forEach((resultItem, index) => {
        if (resultItem.status === 'fulfilled') {
          if(index === 0) {
            deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = (resultItem.value as EdgeServiceCompatibilitiesResponse).compatibilities
          } else {
            deviceTypeResultMap[CompatibilityDeviceEnum.AP] = (resultItem.value as EdgeSdLanApCompatibilitiesResponse).compatibilities
          }
        }
      })

      setData(deviceTypeResultMap)
    } catch(e) {
      // eslint-disable-next-line no-console
      console.error('EdgeCompatibilityDrawer api error:', e)
    }
  }

  useEffect(() => {
    if (!skip)
      fetchEdgeCompatibilities(serviceIds)
  }, [serviceIds, skip])

  return data
}

export const useEdgeSdLanDetailsCompatibilitiesData = (props: {
  serviceId: string,
  skip?: boolean,
}) => {
  return useEdgeSvcPcyDetailsCompatibilitiesData({
    ...props,
    useEdgeSvcPcyCompatibleQuery: useLazyGetSdLanEdgeCompatibilitiesQuery,
    useEdgeSvcPcyApCompatibleQuery: useLazyGetSdLanApCompatibilitiesQuery
  })
}

export const useEdgePinDetailsCompatibilitiesData = (props: {
  serviceId: string,
  skip?: boolean,
}) => {
  return useEdgeSvcPcyDetailsCompatibilitiesData({
    ...props,
    useEdgeSvcPcyCompatibleQuery: useLazyGetPinEdgeCompatibilitiesQuery
    // useEdgeSvcPcyApCompatibleQuery: useLazyGetPinApCompatibilitiesQuery
  })
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultQueryDefinition<ResultType> = QueryDefinition<any, any, any, ResultType>
export const useEdgeSvcPcyDetailsCompatibilitiesData = (props: {
  serviceId: string,
  skip?: boolean,
  useEdgeSvcPcyCompatibleQuery: UseLazyQuery<DefaultQueryDefinition<EdgeServiceCompatibilitiesResponse>>,
  useEdgeSvcPcyApCompatibleQuery?: UseLazyQuery<DefaultQueryDefinition<EdgeServicesApCompatibilitiesResponse>> | UseLazyQuery<DefaultQueryDefinition<EdgeSdLanApCompatibilitiesResponse>> | undefined
}) => {
  const { serviceId, skip = false, useEdgeSvcPcyCompatibleQuery, useEdgeSvcPcyApCompatibleQuery } = props
  const [ isInitializing, setIsInitializing ] = useState(false)
  const [ data, setData ] = useState<Record<string, Record<string, ApCompatibility>>>({})

  const [getEdgeSvcPcyCompatibilities] = useEdgeSvcPcyCompatibleQuery()
  const apCompatibilityFn = useEdgeSvcPcyApCompatibleQuery?.()

  const fetchEdgeCompatibilities = async () => {
    try {
      setIsInitializing(true)

      const reqs: unknown[] = [getEdgeSvcPcyCompatibilities({ payload: { filters: { serviceIds: [serviceId] } } }).unwrap()]
      if (apCompatibilityFn) {
        reqs.push(apCompatibilityFn[0]({ payload: { filters: { serviceIds: [serviceId] } } }).unwrap())
      }

      const deviceTypeResultMap: Record<string, Record<string, ApCompatibility>> = {}
      const results = await Promise.allSettled(reqs)
      results.forEach((resultItem, index) => {
        if (resultItem.status === 'fulfilled') {
          if(index === 0) {
            const details = getFeaturesIncompatibleDetailData((resultItem.value as EdgeServiceCompatibilitiesResponse).compatibilities[0])
            deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = details
          } else {
            const details = getFeaturesIncompatibleDetailData((resultItem.value as EdgeServicesApCompatibilitiesResponse).compatibilities[0])
            deviceTypeResultMap[CompatibilityDeviceEnum.AP] = details
          }
        }
      })

      setData(deviceTypeResultMap)
      setIsInitializing(false)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('EdgeCompatibilityDrawer api error:', e)
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    if (!skip) {
      fetchEdgeCompatibilities()
    }
  }, [skip])

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
  const [ getApFeatureSets ] = useLazyGetApFeatureSetsQuery()

  const fetchEdgeCompatibilities = async () => {
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
  }

  useEffect(() => {
    if (!skip)
      fetchEdgeCompatibilities()
  }, [skip])

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

        edgeCompatibilitiesResponse = sdLanToApCompatibilityData(venueEdgeCompatibilities.compatibilities)
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
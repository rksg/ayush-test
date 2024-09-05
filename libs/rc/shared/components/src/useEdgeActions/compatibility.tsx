import { useState, useEffect, useMemo } from 'react'

import { get, sumBy } from 'lodash'

import {
  useLazyGetSdLanEdgeCompatibilitiesQuery,
  useLazyGetSdLanApCompatibilitiesQuery,
  useLazyGetEdgeFeatureSetsQuery,
  useLazyGetApFeatureSetsQuery,
  useLazyGetVenueEdgeCompatibilitiesQuery
}   from '@acx-ui/rc/services'
import {
  ApCompatibility,
  EdgeSdLanApCompatibilitiesResponse,
  EdgeSdLanCompatibilitiesResponse,
  IncompatibilityFeatures,
  isApRelatedEdgeFeature,
  CompatibilityDeviceEnum,
  EdgeSdLanApCompatibility,
  EdgeSdLanCompatibility,
  ApIncompatibleDevice,
  ApIncompatibleFeature,
  EntityCompatibility
} from '@acx-ui/rc/utils'

import { EdgeCompatibilityDrawerProps, EdgeCompatibilityType } from '../Compatibility/EdgeCompatibilityDrawer'

// eslint-disable-next-line max-len
export const useEdgeSdLanCompatibilityData = (serviceIds: string[], skip: boolean = false) => {
  // eslint-disable-next-line max-len
  const [data, setData] = useState<Record<string, EdgeSdLanCompatibility[] | EdgeSdLanApCompatibility[]> | undefined>(undefined)

  const [getSdLanEdgeCompatibilities] = useLazyGetSdLanEdgeCompatibilitiesQuery()
  const [getSdLanApCompatibilities] = useLazyGetSdLanApCompatibilitiesQuery()

  const fetchEdgeCompatibilities = async (ids: string[]) => {
    try {
      const result = await Promise.allSettled([
        getSdLanEdgeCompatibilities({ payload: { filters: { serviceIds: ids } } }).unwrap(),
        getSdLanApCompatibilities({ payload: { filters: { serviceIds: ids } } }).unwrap()
      ])

      // eslint-disable-next-line max-len
      const deviceTypeResultMap: Record<string, EdgeSdLanCompatibility[] | EdgeSdLanApCompatibility[]> = {}
      result.forEach((resultItem, index) => {
        if (resultItem.status === 'fulfilled') {
          if(index === 0) {
            // eslint-disable-next-line max-len
            deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = (resultItem.value as EdgeSdLanCompatibilitiesResponse).compatibilities
          } else {
            // eslint-disable-next-line max-len
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

// eslint-disable-next-line max-len
const getFeaturesIncompatibleDetailData = (compatibleData: EdgeSdLanCompatibility | EdgeSdLanApCompatibility) => {
  const isEdgePerspective = compatibleData.hasOwnProperty('clusterEdgeCompatibilities')

  const resultMapping : Record<string, ApCompatibility> = {}

  if (isEdgePerspective) {
    const data = (compatibleData as EdgeSdLanCompatibility).clusterEdgeCompatibilities
    data.forEach(item => {
      item.incompatibleFeatures?.forEach(feature => {
        const featureName = feature.featureRequirement.featureName

        if (!resultMapping[featureName]) {
          resultMapping[featureName] = {
            id: `edge_incompatible_details_${featureName}`,
            incompatibleFeatures: [{
              featureName,
              requiredFw: feature.featureRequirement.requiredFw
            }],
            incompatible: 0,
            total: 0
          } as ApCompatibility
        }

        // eslint-disable-next-line max-len
        resultMapping[featureName].incompatible += sumBy(feature.incompatibleDevices, (d) => d.count)
        resultMapping[featureName].total += item.total
        // eslint-disable-next-line max-len
        resultMapping[featureName].incompatibleFeatures![0].incompatibleDevices = [
          { count: resultMapping[featureName].incompatible } as ApIncompatibleDevice]
      })
    })
  } else {
    const data = (compatibleData as EdgeSdLanApCompatibility).venueSdLanApCompatibilities
    data.forEach(item => {
      item.incompatibleFeatures?.forEach(feature => {
        const featureName = feature.featureName

        if (!resultMapping[featureName]) {
          resultMapping[featureName] = {
            id: `ap_incompatible_details_${featureName}`,
            incompatibleFeatures: [{
              featureName,
              requiredFw: feature.requiredFw,
              supportedModelFamilies: feature.supportedModelFamilies
            }],
            incompatible: 0,
            total: 0
          } as ApCompatibility
        }

        // eslint-disable-next-line max-len
        resultMapping[featureName].incompatible += sumBy(feature.incompatibleDevices, (d) => d.count)
        resultMapping[featureName].total += item.total
        // eslint-disable-next-line max-len
        resultMapping[featureName].incompatibleFeatures![0].incompatibleDevices = [
          { count: resultMapping[featureName].incompatible } as ApIncompatibleDevice]
      })
    })
  }

  return resultMapping
}

// eslint-disable-next-line max-len
export const useEdgeSdLanDetailsCompatibilitiesData = (serviceId: string, skip: boolean = false) => {
  const [ isInitializing, setIsInitializing ] = useState(false)
  const [ data, setData ] = useState<Record<string, Record<string, ApCompatibility>>>({})

  const [getSdLanEdgeCompatibilities] = useLazyGetSdLanEdgeCompatibilitiesQuery()
  const [getSdLanApCompatibilities] = useLazyGetSdLanApCompatibilitiesQuery()

  const fetchEdgeCompatibilities = async () => {
    try {
      setIsInitializing(true)

      const result = await Promise.allSettled([
        getSdLanEdgeCompatibilities({ payload: { filters: { serviceIds: [serviceId] } } }).unwrap(),
        getSdLanApCompatibilities({ payload: { filters: { serviceIds: [serviceId] } } }).unwrap()
      ])

      const deviceTypeResultMap: Record<string, Record<string, ApCompatibility>> = {}
      result.forEach((resultItem, index) => {
        if (resultItem.status === 'fulfilled') {
          if(index === 0) {
            // eslint-disable-next-line max-len
            const details = getFeaturesIncompatibleDetailData((resultItem.value as EdgeSdLanCompatibilitiesResponse).compatibilities[0])
            deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = details
          } else {
            // eslint-disable-next-line max-len
            const details = getFeaturesIncompatibleDetailData((resultItem.value as EdgeSdLanApCompatibilitiesResponse).compatibilities[0])
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

  return useMemo(() => ({ sdLanCompatibilities: data, isLoading: isInitializing }),
    [data, isInitializing])
}

// eslint-disable-next-line max-len
export const getSdLanDetailsCompatibilitiesDrawerData = (sdLanCompatibilities: Record<string, Record<string, ApCompatibility>>, featureName: string) => {
  const edgeData = get(sdLanCompatibilities, [CompatibilityDeviceEnum.EDGE, featureName])
  const apData = get(sdLanCompatibilities, [CompatibilityDeviceEnum.AP, featureName])
  const result = {} as Record<string, ApCompatibility>
  if (edgeData) result[CompatibilityDeviceEnum.EDGE] = edgeData
  if (apData) result[CompatibilityDeviceEnum.AP] = apData

  return result
}

// eslint-disable-next-line max-len
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

// eslint-disable-next-line max-len
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
        // eslint-disable-next-line max-len
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

// eslint-disable-next-line max-len
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
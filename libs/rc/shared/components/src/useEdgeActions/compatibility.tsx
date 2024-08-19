import { useState, useEffect, useMemo } from 'react'

import { find } from 'lodash'

import {
  useLazyGetSdLanEdgeCompatibilitiesQuery,
  useLazyGetSdLanApCompatibilitiesQuery,
  useLazyGetEdgeFeatureSetsQuery,
  useLazyGetApFeatureSetsQuery
}   from '@acx-ui/rc/services'
import {
  ApCompatibility,
  EdgeSdLanApCompatibilitiesResponse,
  EdgeSdLanCompatibilitiesResponse,
  IncompatibilityFeatures,
  isApRelatedEdgeFeature,
  CompatibilityDeviceEnum,
  EdgeSdLanApCompatibility,
  EdgeSdLanCompatibility
} from '@acx-ui/rc/utils'

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
export const useEdgeSdLanDetailsCompatibilitiesData = (serviceId: string, skip: boolean = false) => {
  const [ isInitializing, setIsInitializing ] = useState(false)
  const [ data, setData ] = useState<Record<string, ApCompatibility>>({})

  const [getSdLanEdgeCompatibilities] = useLazyGetSdLanEdgeCompatibilitiesQuery()
  const [getSdLanApCompatibilities] = useLazyGetSdLanApCompatibilitiesQuery()

  const fetchEdgeCompatibilities = async () => {
    try {
      setIsInitializing(true)

      const result = await Promise.allSettled([
        getSdLanEdgeCompatibilities({ payload: { filters: { serviceIds: [serviceId] } } }).unwrap(),
        getSdLanApCompatibilities({ payload: { filters: { serviceIds: [serviceId] } } }).unwrap()
      ])

      const deviceTypeResultMap: Record<string, ApCompatibility> = {}
      result.forEach((resultItem, index) => {
        if (resultItem.status === 'fulfilled') {
          if(index === 0) {
            // eslint-disable-next-line max-len
            const clusterEdgeCompatibilities = (resultItem.value as EdgeSdLanCompatibilitiesResponse).compatibilities[0].clusterEdgeCompatibilities

            let incompatible = 0
            let total = 0
            let requiredFw
            clusterEdgeCompatibilities.forEach(item => {
              // eslint-disable-next-line max-len
              const sdLan = find(item.incompatibleFeatures, (f) => f.featureRequirement.featureName === IncompatibilityFeatures.SD_LAN )
              if (sdLan)
                requiredFw = sdLan.featureRequirement.requiredFw

              incompatible += item.incompatible
              total += item.total
            })

            deviceTypeResultMap[CompatibilityDeviceEnum.EDGE] = {
              id: 'SD_LAN_edge_details',
              incompatibleFeatures: [{
                featureName: IncompatibilityFeatures.SD_LAN,
                requiredFw,
                incompatibleDevices: [{ count: incompatible }]
              }],
              incompatible,
              total
            } as ApCompatibility
          } else {
            // eslint-disable-next-line max-len
            const venueSdLanApCompatibilities = (resultItem.value as EdgeSdLanApCompatibilitiesResponse).compatibilities[0].venueSdLanApCompatibilities

            let incompatible = 0
            let total = 0
            let requiredFw, supportedModelFamilies
            venueSdLanApCompatibilities.forEach(item => {
              // eslint-disable-next-line max-len
              const target = find(item.incompatibleFeatures, { featureName: IncompatibilityFeatures.SD_LAN })
              if (target) {
                requiredFw = target.requiredFw
                supportedModelFamilies = target.supportedModelFamilies

                incompatible += item.incompatible
                total += item.total
              }
            })

            deviceTypeResultMap[CompatibilityDeviceEnum.AP] = {
              id: 'SD_LAN_wifi_details',
              incompatibleFeatures: [{
                featureName: IncompatibilityFeatures.SD_LAN,
                requiredFw,
                supportedModelFamilies,
                incompatibleDevices: [{ count: incompatible }]
              }],
              incompatible,
              total
            } as ApCompatibility
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
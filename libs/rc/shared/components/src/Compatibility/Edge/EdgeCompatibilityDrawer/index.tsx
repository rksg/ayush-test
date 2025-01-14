import { useState, useEffect, useMemo, useCallback } from 'react'

import { isNil }   from 'lodash'
import { useIntl } from 'react-intl'

import {
  useLazyGetEdgeFeatureSetsQuery,
  useLazyGetVenueEdgeCompatibilitiesQuery }   from '@acx-ui/rc/services'
import {
  ApCompatibility,
  ApIncompatibleDevice,
  ApIncompatibleFeature,
  EntityCompatibility,
  IncompatibilityFeatures, CompatibilityType, CompatibilityDeviceEnum
} from '@acx-ui/rc/utils'

import {
  useEdgeCompatibilityRequirementData,
  useEdgeSdLanDetailsCompatibilitiesData,
  transformEdgeCompatibilitiesWithFeatureName
} from '../../../useEdgeActions/compatibility'
import { CompatibilityDrawer }           from '../../CompatibilityDrawer'
import { EdgeDetailCompatibilityDrawer } from '../EdgeDetailCompatibilityDrawer'

export enum EdgeCompatibilityType {
  SD_LAN = 'SD-LAN',
  DEVICE = 'Device',
  VENUE = 'Venue',
  ALONE = 'ALONE',
}

export type EdgeCompatibilityDrawerProps = {
  visible: boolean,
  onClose: () => void
  title?: string,
  type?: EdgeCompatibilityType,
  venueId?: string,
  venueName?: string,
  featureName?: IncompatibilityFeatures,
  edgeId?: string,
  serviceId?: string,
  data?: EntityCompatibility[],
  width?: number
}

export const EdgeCompatibilityDrawer = (props: EdgeCompatibilityDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    title,
    type = EdgeCompatibilityType.VENUE,
    venueId, venueName,
    featureName,
    onClose,
    width
  } = props

  // eslint-disable-next-line max-len
  const skipFetchCompatibilities = !visible || (type !== EdgeCompatibilityType.VENUE && type !== EdgeCompatibilityType.DEVICE)
  const {
    edgeCompatibilities, isLoading
  } = useVenueEdgeCompatibilitiesData(props, skipFetchCompatibilities)

  // eslint-disable-next-line max-len
  const skipFetchSdLanDetailCompatibilities = !visible || type !== EdgeCompatibilityType.SD_LAN || !props.serviceId
  const {
    compatibilities: sdLanCompatibilities,
    isLoading: isDetailCompatibilitiesLoading
  } = useEdgeSdLanDetailsCompatibilitiesData({
    serviceId: props.serviceId!,
    skip: skipFetchSdLanDetailCompatibilities
  })

  const skipFetchFeatureInfo = !visible || type !== EdgeCompatibilityType.ALONE || !featureName
  const {
    featureInfos,
    isLoading: isFeatureInfoLoading
  } = useEdgeCompatibilityRequirementData(featureName!, skipFetchFeatureInfo)

  return type === EdgeCompatibilityType.VENUE || type === EdgeCompatibilityType.DEVICE
    ? <CompatibilityDrawer
      data-testid={'edge-compatibility-drawer'}
      visible={visible}
      title={title ?? ''}
      compatibilityType={type === EdgeCompatibilityType.DEVICE
        ? CompatibilityType.DEVICE
        : (featureName ? CompatibilityType.FEATURE : CompatibilityType.VENUE)
      }
      data={edgeCompatibilities ?? []}
      onClose={onClose}
      isLoading={isLoading}
      deviceType={CompatibilityDeviceEnum.EDGE}

      venueId={venueId}
      venueName={venueName}
      featureName={featureName}
      width={width}
    />
    : <EdgeDetailCompatibilityDrawer
      visible={visible}
      featureName={featureName!}
      title={type === EdgeCompatibilityType.ALONE
        ? $t({ defaultMessage: 'Compatibility Requirement' })
        : $t({ defaultMessage: 'Incompatibility Details' })
      }
      isLoading={type === EdgeCompatibilityType.ALONE
        ? isFeatureInfoLoading
        : isDetailCompatibilitiesLoading
      }
      data={type === EdgeCompatibilityType.ALONE
        ? featureInfos
        : transformEdgeCompatibilitiesWithFeatureName(sdLanCompatibilities, featureName!)
      }
      onClose={onClose}
    />
}

// eslint-disable-next-line max-len
const useVenueEdgeCompatibilitiesData = (props: EdgeCompatibilityDrawerProps, skip: boolean = false) => {
  const { data, type = EdgeCompatibilityType.VENUE, featureName, venueId, edgeId } = props
  const [ isInitializing, setIsInitializing ] = useState<boolean>(false)
  // eslint-disable-next-line max-len
  const [ edgeCompatibilities, setEdgeCompatibilities ] = useState<ApCompatibility[] | undefined>(undefined)

  const [getEdgeFeatureSets] = useLazyGetEdgeFeatureSetsQuery()
  const [getVenueEdgeCompatibilities] = useLazyGetVenueEdgeCompatibilitiesQuery()

  const getEdgeCompatibilities = useCallback(async () => {
    try {
      setIsInitializing(true)

      const featureNames = featureName ? [featureName] : []
      let edgeCompatibilitiesResponse: ApCompatibility[] = []

      // eslint-disable-next-line max-len
      if ((type === EdgeCompatibilityType.VENUE || type === EdgeCompatibilityType.DEVICE) && data?.length) {
        edgeCompatibilitiesResponse = sdLanToApCompatibilityData(data)
        setEdgeCompatibilities(edgeCompatibilitiesResponse)
        setIsInitializing(false)
        return
      }

      if (type === EdgeCompatibilityType.VENUE || type === EdgeCompatibilityType.DEVICE) {
        const venueEdgeCompatibilities = await getVenueEdgeCompatibilities({ payload: {
          filters: {
            ...(venueId ? { venueIds: [venueId] } : undefined),
            ...(edgeId ? { edgeIds: [edgeId] } : undefined)
          } }
        }).unwrap()
        // eslint-disable-next-line max-len
        edgeCompatibilitiesResponse = sdLanToApCompatibilityData(venueEdgeCompatibilities.compatibilities ?? [])
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
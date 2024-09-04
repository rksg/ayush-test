import { useState, useEffect, useMemo } from 'react'

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
  getSdLanDetailsCompatibilitiesDrawerData
} from '../../useEdgeActions/compatibility'
import { CompatibilityDrawer }           from '../CompatibilityDrawer'
import { EdgeDetailCompatibilityDrawer } from '../EdgeDetailCompatibilityDrawer'

export enum EdgeCompatibilityType {
  SD_LAN = 'SD-LAN',
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
    edgeId,
    featureName,
    onClose,
    width
  } = props

  const skipFetchCompatibilities = !visible || type !== EdgeCompatibilityType.VENUE
  const {
    edgeCompatibilities, isLoading
  } = useVenueEdgeCompatibilitiesData(props, skipFetchCompatibilities)

  // eslint-disable-next-line max-len
  const skipFetchSdLanDetailCompatibilities = !visible || type !== EdgeCompatibilityType.SD_LAN || !props.serviceId
  const {
    sdLanCompatibilities,
    isLoading: isDetailCompatibilitiesLoading
  } = useEdgeSdLanDetailsCompatibilitiesData(props.serviceId!, skipFetchSdLanDetailCompatibilities)

  const skipFetchFeatureInfo = !visible || type !== EdgeCompatibilityType.ALONE || !featureName
  const {
    featureInfos,
    isLoading: isFeatureInfoLoading
  } = useEdgeCompatibilityRequirementData(featureName!, skipFetchFeatureInfo)

  return type !== EdgeCompatibilityType.VENUE
    ? <EdgeDetailCompatibilityDrawer
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
        : getSdLanDetailsCompatibilitiesDrawerData(sdLanCompatibilities, featureName!)
      }
      onClose={onClose}
    />
    : <CompatibilityDrawer
      data-testid={'edge-compatibility-drawer'}
      visible={visible}
      title={title ?? ''}
      compatibilityType={edgeId
        ? CompatibilityType.DEVICE
        : (featureName ? CompatibilityType.FEATURE : CompatibilityType.VENUE)
      }
      data={edgeCompatibilities}
      onClose={onClose}
      isLoading={isLoading}
      deviceType={CompatibilityDeviceEnum.EDGE}

      venueId={venueId}
      venueName={venueName}
      featureName={featureName}
      width={width}
    />
}

// eslint-disable-next-line max-len
const useVenueEdgeCompatibilitiesData = (props: EdgeCompatibilityDrawerProps, skip: boolean = false) => {
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
        if (data?.length) {
          edgeCompatibilitiesResponse = sdLanToApCompatibilityData(data)
          setEdgeCompatibilities(edgeCompatibilitiesResponse)
          return
        }

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
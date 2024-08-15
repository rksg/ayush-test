import { useState, useEffect, useMemo } from 'react'

import { Form }                   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Drawer, Loader, Tabs }           from '@acx-ui/components'
import {
  useLazyGetEdgeFeatureSetsQuery,
  useLazyGetVenueEdgeCompatibilitiesQuery,
  useLazyGetSdLanEdgeCompatibilitiesQuery,
  useLazyGetSdLanApCompatibilitiesQuery
}   from '@acx-ui/rc/services'
import { ApCompatibility, ApEdgeCompatibilitiesResponse, ApIncompatibleDevice, ApIncompatibleFeature, ServiceEdgeCompatibilitiesResponse, VenueEdgeCompatibility } from '@acx-ui/rc/utils'

import { CompatibilityItem }                                                   from '../../Compatibility/CompatibilityItem'
import { InCompatibilityFeatures, CompatibilityDeviceEnum, CompatibilityType } from '../constants'
import { compatibilityDataGroupByDeviceType }                                  from '../utils'

export enum EdgeCompatibilityType {
  SD_LAN = 'SD-LAN',
  VENUE = 'Venue',
  ALONE = 'ALONE',
}

export type EdgeCompatibilityDrawerProps = {
  visible: boolean,
  title: string,
  onClose: () => void
  type?: EdgeCompatibilityType,
  venueId?: string,
  venueName?: string,
  featureName?: InCompatibilityFeatures,
  edgeIds?: string[],
  serviceIds?: string[],
  data?: VenueEdgeCompatibility[],
}

export const EdgeCompatibilityDrawer = (props: EdgeCompatibilityDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    title,
    type = EdgeCompatibilityType.VENUE,
    venueId, venueName,
    featureName
  } = props

  const { edgeCompatibilities, isLoading } = useCompatibilitiesData(props)

  const getContent = (items: ApCompatibility[]) => {
    return <Loader states={[ { isLoading } ]}>
      <Form layout='vertical' data-testid='edgeCompatibility-form'>
        {items.map(item => {
          const compatibilityData = compatibilityDataGroupByDeviceType(item)
          const deviceTypes = Object.keys(compatibilityData)
          const isCrossDevice = deviceTypes.length > 1
          const isVenueLevel = type === EdgeCompatibilityType.VENUE

          return isCrossDevice
            ? isVenueLevel
              ? <Tabs defaultActiveKey={deviceTypes[0]}>
                {deviceTypes.map((deviceType) => <Tabs.TabPane
                  key={deviceType}
                  tab={$t(getDeviceTypeDisplayName(deviceType as CompatibilityDeviceEnum))}
                >
                  <CompatibilityItem
                    type={getCompatibilityType(type)}
                    data={compatibilityData[deviceType]}
                    totalDevices={item.total}
                    venueId={venueId}
                    venueName={venueName}
                    featureName={featureName}
                  />
                </Tabs.TabPane>)}
              </Tabs>
              : deviceTypes.map((deviceType, index) => {
                return <><CompatibilityItem
                  type={getCompatibilityType(type)}
                  data={compatibilityData[deviceType]}
                  totalDevices={item.total}
                  venueId={venueId}
                  venueName={venueName}
                  featureName={featureName}
                />
                {index < deviceTypes.length - 1 && <hr />}
                </>
              })
            : <CompatibilityItem
              type={getCompatibilityType(type)}
              data={compatibilityData[deviceTypes[0]]}
              totalDevices={item.total}
              venueId={venueId}
              venueName={venueName}
              featureName={featureName}
            />
        })}
      </Form>
    </Loader>
  }

  return (
    <Drawer
      data-testid={'edge-compatibility-drawer'}
      title={title}
      visible={visible}
      closable={true}
      onClose={props.onClose}
      children={getContent(edgeCompatibilities)}
      destroyOnClose={true}
      width={'500px'}
    />
  )
}

const useCompatibilitiesData = (props: EdgeCompatibilityDrawerProps) => {
  const { data, type, featureName, venueId, serviceIds } = props
  const [ isInitializing, setIsInitializing ] = useState(data?.length === 0)
  const [ edgeCompatibilities, setEdgeCompatibilities ] = useState<ApCompatibility[]>([])

  const [getEdgeFeatureSets] = useLazyGetEdgeFeatureSetsQuery()
  const [getVenueEdgeCompatibilities] = useLazyGetVenueEdgeCompatibilitiesQuery()
  const [getSdLanEdgeCompatibilities] = useLazyGetSdLanEdgeCompatibilitiesQuery()
  const [getSdLanApCompatibilities] = useLazyGetSdLanApCompatibilitiesQuery()

  const fetchEdgeCompatibilities = async () => {
    try {
      const featureNames = [featureName] ?? []

      let edgeCompatibilitiesResponse: ApCompatibility[] = []

      if (type === EdgeCompatibilityType.VENUE) {
        const venueEdgeCompatibilities = await getVenueEdgeCompatibilities({
          payload: { filters: { venueIds: [venueId] } }
        }).unwrap()
        // eslint-disable-next-line max-len
        edgeCompatibilitiesResponse = transformCompatibilityData(venueEdgeCompatibilities.compatibilities)
      } else if (type === EdgeCompatibilityType.SD_LAN) {
        const result = await Promise.allSettled([
          getSdLanEdgeCompatibilities({ payload: { filters: { serviceIds } } }).unwrap(),
          getSdLanApCompatibilities({ payload: { filters: { serviceIds } } }).unwrap()
        ])

        edgeCompatibilitiesResponse = []
        result.forEach((resultItem, index) => {
          if (resultItem.status === 'fulfilled') {
            const _data = index === 0
              // eslint-disable-next-line max-len
              ? transformCompatibilityData((resultItem.value as ServiceEdgeCompatibilitiesResponse).compatibilities[0].venueSdLanEdgeCompatibilities)
              // eslint-disable-next-line max-len
              : (resultItem.value as ApEdgeCompatibilitiesResponse).compatibilities[0].venueSdLanApCompatibilities

            edgeCompatibilitiesResponse.push(...(_data as ApCompatibility[]))
          }
        })

      } else {
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
    fetchEdgeCompatibilities()
  }, [])

  return useMemo(() => ({ edgeCompatibilities, isLoading: isInitializing }),
    [edgeCompatibilities, isInitializing])
}

const transformCompatibilityData = (data: VenueEdgeCompatibility[]): ApCompatibility[] => {
  return data.map(item => ({
    id: item.venueId,
    total: item.total,
    incompatible: item.incompatible,
    incompatibleFeatures: item.incompatibleFeatures?.map(incompatibleFeature => ({
      featureName: incompatibleFeature.featureRequirement.featureName,
      requiredFw: incompatibleFeature.featureRequirement.requiredFw,
      incompatibleDevices: incompatibleFeature.incompatibleDevices as ApIncompatibleDevice[]
    } as ApIncompatibleFeature))
  } as ApCompatibility))
}


const getDeviceTypeDisplayName = (deviceType: CompatibilityDeviceEnum) => {
  return deviceType === CompatibilityDeviceEnum.EDGE
    ? defineMessage({ defaultMessage: 'SmartEdge' })
    : defineMessage({ defaultMessage: 'Wi-Fi' })
}

const getCompatibilityType = (type: EdgeCompatibilityType): CompatibilityType => {
  switch(type) {
    case EdgeCompatibilityType.VENUE:
      return CompatibilityType.VENUE
    case EdgeCompatibilityType.ALONE:
      return CompatibilityType.ALONE
    default:
      return CompatibilityType.EDGE
  }
}
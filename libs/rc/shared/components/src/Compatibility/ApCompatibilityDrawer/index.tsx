/* eslint-disable max-len */
import { useState, useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Loader, Tabs }  from '@acx-ui/components'
import {
  useLazyGetApCompatibilitiesVenueQuery,
  useLazyGetApCompatibilitiesNetworkQuery,
  useLazyGetApFeatureSetsQuery
}   from '@acx-ui/rc/services'
import { ApCompatibility, ApCompatibilityResponse, ApIncompatibleFeature } from '@acx-ui/rc/utils'

import { CompatibilityItem }                                                   from '../CompatibilityItem'
import { InCompatibilityFeatures, CompatibilityDeviceEnum, CompatibilityType } from '../constants'
import { getDeviceTypeDisplayName, compatibilityDataGroupByDeviceType }        from '../utils'

export enum ApCompatibilityType {
  NETWORK = 'Network',
  VENUE = 'Venue',
  ALONE = 'ALONE',
}

export type ApCompatibilityDrawerProps = {
  visible: boolean,
  type?: ApCompatibilityType,
  isMultiple?: boolean,
  venueId?: string,
  venueName?: string,
  networkId?: string,
  apName?: string,
  featureName?: InCompatibilityFeatures,
  networkIds?: string[],
  apIds?: string[],
  venueIds?: string[],
  data?: ApCompatibility[],
  onClose: () => void
}

/*
Sample 1: Open drawer and then fetch data
  <ApCompatibilityDrawer
    visible={drawerVisible}
    type={ApCompatibilityType.VENUE}
    venueId={venueId}
    featureName={InCompatibilityFeatures.BETA_DPSK3}
    venueName={venueData?.name ?? ''}
    queryType={ApCompatibilityQueryTypes.CHECK_VENUE_WITH_FEATURE}
    onClose={() => setDrawerVisible(false)}
  />

Sample 2: Display data on drawer
  <ApCompatibilityDrawer
    isMultiple
    type={ApCompatibilityType.VENUE}
    visible={drawerVisible}
    data={apCompatibility}
    onClose={() => setDrawerVisible(false)}
  />
*/
export const ApCompatibilityDrawer = (props: ApCompatibilityDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    type=ApCompatibilityType.VENUE,
    isMultiple=false,
    venueId, venueName,
    networkId,
    featureName,
    apName, apIds=[], networkIds=[], venueIds=[], data=[] } = props

  const [ isInitializing, setIsInitializing ] = useState(data?.length === 0)
  const [ apCompatibilities, setApCompatibilities ] = useState<ApCompatibility[]>(data)
  const [ getApCompatibilitiesVenue ] = useLazyGetApCompatibilitiesVenueQuery()
  const [ getApCompatibilitiesNetwork ] = useLazyGetApCompatibilitiesNetworkQuery()
  const [ getApFeatureSets ] = useLazyGetApFeatureSetsQuery()

  const apNameTitle = (apName) ? `: ${apName}` : ''

  const title = isMultiple
    ? ($t({ defaultMessage: 'Incompatibility Details' }) + apNameTitle)
    : $t({ defaultMessage: 'Compatibility Requirement' })

  const getApCompatibilities = async () => {
    const feature = featureName ?? ''

    if (ApCompatibilityType.NETWORK === type) {
      return getApCompatibilitiesNetwork({
        params: { networkId },
        payload: { filters: { apIds, venueIds }, feature }
      }).unwrap()
    } else if (ApCompatibilityType.VENUE === type) {
      return getApCompatibilitiesVenue({
        params: { venueId },
        payload: { filters: { apIds, networkIds }, feature }
      }).unwrap()
    }
    const apFeatureSets = await getApFeatureSets({
      params: { featureName: encodeURI(feature) }
    }).unwrap()
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
          setApCompatibilities(apCompatibilitiesResponse?.apCompatibilities)
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

  const getContent = (items: ApCompatibility[]) => {
    return <Loader states={[ { isLoading: isInitializing } ]}>
      <Form layout='vertical' data-testid='apCompatibility-form'>
        {items.map(item => {
          const compatibilityData = compatibilityDataGroupByDeviceType(item)
          const deviceTypes = Object.keys(compatibilityData)
          const isCrossDevice = deviceTypes.length > 1

          return isCrossDevice
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
      data-testid={'ap-compatibility-drawer'}
      title={title}
      visible={visible}
      closable={true}
      onClose={props.onClose}
      children={getContent(apCompatibilities)}
      destroyOnClose={true}
      width={'500px'}
    />
  )
}

const getCompatibilityType = (type: ApCompatibilityType): CompatibilityType => {
  switch(type) {
    case ApCompatibilityType.VENUE:
      return CompatibilityType.VENUE
    case ApCompatibilityType.ALONE:
      return CompatibilityType.ALONE
    default:
      return CompatibilityType.AP
  }
}
import { Form } from 'antd'
import { omit } from 'lodash'

import { Drawer, Loader }         from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ApCompatibility,
  Compatibility,
  CompatibilityDeviceEnum,
  CompatibilitySelectedApInfo,
  CompatibilityType,
  IncompatibilityFeatures
} from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady }               from '../../useEdgeActions'
import {
  apCompatibilityDataGroupByFeatureDeviceType,
  compatibilityDataGroupByFeatureDeviceType
} from '../utils'

import { CompatibilityItem }           from './CompatibilityItem'
import { SameDeviceTypeCompatibility } from './SameDeviceTypeCompatibility'
import { useDescription }              from './utils'

/**
 * featureName: when specified on a feature
 * requiredFeatures: when `featureName` has other dependency features
 */
export type CompatibilityDrawerProps = {
  visible: boolean,
  title: string,
  data: Compatibility[] | ApCompatibility[],
  compatibilityType: CompatibilityType,

  onClose: () => void
  isLoading?: boolean,
  deviceType?: CompatibilityDeviceEnum,

  apInfo?: CompatibilitySelectedApInfo,
  venueId?: string,
  venueName?: string,
  featureName?: IncompatibilityFeatures,

  width?: number
}

export const CompatibilityDrawer = (props: CompatibilityDrawerProps) => {
  const {
    visible,
    title,
    data,
    onClose,
    isLoading = false,
    deviceType = CompatibilityDeviceEnum.AP,
    width = 500,
    ...others
  } = props

  return (
    <Drawer
      title={title}
      visible={visible}
      closable={true}
      onClose={onClose}
      destroyOnClose={true}
      width={width}
    >
      <Loader states={[ { isLoading } ]}>
        <Form layout='vertical'>
          {data.map(item => <DrawerContentUnit
            key={item.id}
            data={item}
            deviceType={deviceType}
            {...others}
          />)}
        </Form>
      </Loader>
    </Drawer>
  )
}

// eslint-disable-next-line max-len
interface DrawerContentUnitProps extends Omit<CompatibilityDrawerProps, 'data' | 'visible' | 'isLoading' | 'onClose' | 'title'> {
  data: Compatibility | ApCompatibility,
  deviceType: CompatibilityDeviceEnum,
}
const DrawerContentUnit = (props: DrawerContentUnitProps ) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  // eslint-disable-next-line max-len
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const { data, deviceType = CompatibilityDeviceEnum.AP, ...others } = props
  const description = useDescription(omit(props, 'data'))

  // eslint-disable-next-line max-len
  const compatibilityData = ((isApCompatibilitiesByModel && deviceType === CompatibilityDeviceEnum.AP) || (deviceType === CompatibilityDeviceEnum.EDGE && isEdgeCompatibilityEnhancementEnabled))
    ? compatibilityDataGroupByFeatureDeviceType(data as Compatibility)
    : apCompatibilityDataGroupByFeatureDeviceType(data as ApCompatibility)
  const deviceTypes = Object.keys(compatibilityData)
  const isCrossDevices = deviceTypes.length > 1
  const isSpecificFeature = props.featureName

  if (!isSpecificFeature &&
    (((isApCompatibilitiesByModel || isCrossDevices) && deviceType === CompatibilityDeviceEnum.AP)
  // eslint-disable-next-line max-len
  || (deviceType === CompatibilityDeviceEnum.EDGE && (props.compatibilityType === CompatibilityType.VENUE || props.compatibilityType === CompatibilityType.DEVICE)))) {
    return <SameDeviceTypeCompatibility
      key={data.id}
      types={deviceTypes}
      data={compatibilityData}
      deviceType={deviceType}
      totalDevices={data.total}
      {...others}
    />
  }

  return <CompatibilityItem
    key={data.id}
    data={compatibilityData[deviceTypes[0]]}
    deviceType={deviceType}
    description={description}
    totalDevices={data.total}
    {...others}
  />
}
import { Form } from 'antd'
import { omit } from 'lodash'

import { Drawer, Loader } from '@acx-ui/components'
import {
  ApCompatibility,
  IncompatibilityFeatures,
  CompatibilityDeviceEnum,
  CompatibilityType } from '@acx-ui/rc/utils'

import { compatibilityDataGroupByFeatureDeviceType } from '../utils'

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
  data: ApCompatibility[],
  compatibilityType: CompatibilityType,

  onClose: () => void
  isLoading?: boolean,
  deviceType?: CompatibilityDeviceEnum,

  venueId?: string,
  venueName?: string,
  featureName?: IncompatibilityFeatures,
}

export const CompatibilityDrawer = (props: CompatibilityDrawerProps) => {
  const {
    visible,
    title,
    data,
    onClose,
    isLoading = false,
    deviceType = CompatibilityDeviceEnum.AP,
    ...others
  } = props

  return (
    <Drawer
      title={title}
      visible={visible}
      closable={true}
      onClose={onClose}
      destroyOnClose={true}
      width={'500px'}
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
  data: ApCompatibility,
  deviceType: CompatibilityDeviceEnum,
}
const DrawerContentUnit = (props: DrawerContentUnitProps ) => {
  const { data, deviceType = CompatibilityDeviceEnum.AP, ...others } = props
  const description = useDescription(omit(props, 'data'))

  const compatibilityData = compatibilityDataGroupByFeatureDeviceType(data)
  const deviceTypes = Object.keys(compatibilityData)
  const isCrossDevices = deviceTypes.length > 1

  if (isCrossDevices) {
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
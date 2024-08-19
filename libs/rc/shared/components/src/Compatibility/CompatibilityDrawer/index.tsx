import { Form, Space, Divider, Typography, Row } from 'antd'

import { Drawer, Loader, Tabs }           from '@acx-ui/components'
import {
  ApCompatibility,
  ApIncompatibleFeature,
  IncompatibilityFeatures,
  CompatibilityDeviceEnum,
  CompatibilityType,
  getCompatibilityDeviceTypeDisplayName
} from '@acx-ui/rc/utils'

import { compatibilityDataGroupByFeatureDeviceType } from '../utils'

import { CompatibilityItem } from './CompatibilityItem'

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

  const getContent = (items: ApCompatibility[]) => {
    return items.map(item => {
      const compatibilityData = compatibilityDataGroupByFeatureDeviceType(item)
      const deviceTypes = Object.keys(compatibilityData)
      const isCrossDevices = deviceTypes.length > 1

      if (isCrossDevices) {
        return <SameDeviceTypeCompatibility
          key={item.id}
          types={deviceTypes}
          data={compatibilityData}
          deviceType={deviceType}
          totalDevices={item.total}
          {...others}
        />
      }

      return <CompatibilityItem
        key={item.id}
        data={compatibilityData[deviceTypes[0]]}
        deviceType={deviceType}
        totalDevices={item.total}
        {...others}
      />
    })
  }

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
          {getContent(data)}
        </Form>
      </Loader>
    </Drawer>
  )
}

interface SameDeviceTypeCompatibilityProps {
  types: string[],
  data: Record<string, ApIncompatibleFeature[]>
  compatibilityType: CompatibilityType,
  deviceType: CompatibilityDeviceEnum,
  totalDevices?: number,
  venueId?: string,
  venueName?: string,
  featureName?: IncompatibilityFeatures,
}
const SameDeviceTypeCompatibility = (props: SameDeviceTypeCompatibilityProps) => {
  const { types, data, ...others } = props

  return <Tabs defaultActiveKey={types[0]}>
    {types.map((typeName) =>
      <Tabs.TabPane
        key={typeName}
        tab={getCompatibilityDeviceTypeDisplayName(typeName as CompatibilityDeviceEnum)}
      >
        <CompatibilityItem
          data={data[typeName]}
          {...others}
        />
      </Tabs.TabPane>)}
  </Tabs>
}

interface FeatureCrossDeviceTypeCompatibilityProps {
  data: Record<string, ApCompatibility>
  featureName: IncompatibilityFeatures,
}
// eslint-disable-next-line max-len
export const FeatureCrossDeviceTypeCompatibility = (props: FeatureCrossDeviceTypeCompatibilityProps) => {
  const { data, ...others } = props

  const deviceTypes = Object.keys(data)

  return <Space direction='vertical' split={<Divider />}>
    {deviceTypes.map((typeName) => {
      const typeData = data[typeName]

      return <div key={typeName}>
        <Row>
          <Typography>
            {getCompatibilityDeviceTypeDisplayName(typeName as CompatibilityDeviceEnum)}
          </Typography>
        </Row>
        <CompatibilityItem
          compatibilityType={CompatibilityType.FEATURE}
          data={typeData.incompatibleFeatures ?? []}
          deviceType={typeName as CompatibilityDeviceEnum}
          totalDevices={typeData.total}
          {...others}
        />
      </div>
    })}
  </Space>
}
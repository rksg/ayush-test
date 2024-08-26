import { Col, Form, Row, Space } from 'antd'
import { sumBy }                 from 'lodash'

import { ApIncompatibleFeature, CompatibilityDeviceEnum, IncompatibilityFeatures } from '@acx-ui/rc/utils'

import { FeatureItem } from './FeatureItem'

export type CompatibilityItemProps = {
  deviceType: CompatibilityDeviceEnum,
  data: ApIncompatibleFeature[],
  description?: string | React.ReactNode,
  totalDevices?: number,
  featureName?: IncompatibilityFeatures,
}

export const CompatibilityItem = (props: CompatibilityItemProps) => {
  const {
    deviceType,
    data = [],
    description,
    totalDevices = 0,
    featureName
  } = props

  const getFeatures = (items: ApIncompatibleFeature[]) => {
    const isMultipleFeatures = items.length > 1
    return items?.map((itemDetail) => {
      const incompatible = sumBy(itemDetail.incompatibleDevices, (d) => d.count)

      return <FeatureItem
        key={itemDetail.featureName}
        isMultiple={!featureName || isMultipleFeatures}
        deviceType={deviceType}
        data={itemDetail}
        incompatible={incompatible}
        total={totalDevices}
      />
    })
  }

  return (
    <Row>
      <Col span={24}>
        {description && <Form.Item>
          {description}
        </Form.Item>}
        <Space size='large' direction='vertical'>
          {getFeatures(data)}
        </Space>
      </Col>
    </Row>
  )
}
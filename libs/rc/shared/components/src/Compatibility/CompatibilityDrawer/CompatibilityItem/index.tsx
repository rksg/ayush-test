import React from 'react'

import { Col, Divider, Form, Row, Space } from 'antd'
import { sumBy }                          from 'lodash'

import { ApIncompatibleFeature, CompatibilityDeviceEnum, IncompatibilityFeatures } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

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
    return items?.map((itemDetail, index) => {
      const incompatible = sumBy(itemDetail.incompatibleDevices, (d) => d.count)

      return <React.Fragment key={itemDetail.featureName}>
        {index !== 0 && <Divider style={{ margin: '0' }} />}
        <FeatureItem
          isMultiple={!featureName || isMultipleFeatures}
          deviceType={deviceType}
          data={itemDetail}
          incompatible={incompatible}
          total={totalDevices}
        />
      </React.Fragment>
    })
  }

  return (
    <Row>
      <Col span={24}>
        {description && <Form.Item>
          {description}
        </Form.Item>}
        <Space size={0} direction='vertical' style={{ display: 'flex' }}>
          <UI.StyledWrapper>
            {getFeatures(data)}
          </UI.StyledWrapper>
        </Space>
      </Col>
    </Row>
  )
}

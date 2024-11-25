import React from 'react'

import { Col, Divider, Form, Row } from 'antd'
import { sumBy }                   from 'lodash'

import { ApIncompatibleFeature, CompatibilityDeviceEnum, IncompatibilityFeatures } from '@acx-ui/rc/utils'

import { StyleDiv } from '../styledComponents'

import { FeatureItem } from './FeatureItem'

export type CompatibilityItemProps = {
  deviceType: CompatibilityDeviceEnum,
  data: ApIncompatibleFeature[],
  description?: string | React.ReactNode,
  totalDevices?: number,
  featureName?: IncompatibilityFeatures,
  isCrossDeviceType?: boolean
}

export const CompatibilityItem = (props: CompatibilityItemProps) => {
  const {
    deviceType,
    data,
    description,
    totalDevices = 0,
    featureName,
    isCrossDeviceType = false
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
          isCrossDeviceType={isCrossDeviceType}
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
        <StyleDiv $hasBackgeound={isCrossDeviceType}>
          {getFeatures(data)}
        </StyleDiv>
      </Col>
    </Row>
  )
}

import React from 'react'

import { Col, Divider, Form, Row } from 'antd'
import { sumBy }                   from 'lodash'

import { CompatibilityDeviceEnum, IncompatibilityFeatures, IncompatibleFeature } from '@acx-ui/rc/utils'

import { VerticalFlexDiv } from '../styledComponents'

import { FeatureItem } from './FeatureItem'

export type CompatibilityItemProps = {
  deviceType: CompatibilityDeviceEnum,
  data: IncompatibleFeature[],
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

  const getFeatures = (items: IncompatibleFeature[]) => {
    const isMultipleFeatures = items.length > 1
    return items?.reduce((acc: IncompatibleFeature[], cur: IncompatibleFeature) => {
      if (cur.children) {
        return [...acc, ...cur.children]
      }
      return [...acc, cur]
    }, []).map((itemDetail, index) => {
      const incompatible = sumBy(itemDetail.incompatibleDevices, (d) => d.count)
      return <React.Fragment key={itemDetail.featureName}>
        {/* `multiple device type` will have space control inside FeatureItem*/}
        {index !== 0 && <Divider style={{ margin: isCrossDeviceType ? 0 : '10px 0' }} />}
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
        <VerticalFlexDiv>
          {getFeatures(data)}
        </VerticalFlexDiv>
      </Col>
    </Row>
  )
}

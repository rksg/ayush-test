import React from 'react'

import { Col, Divider, Form, Row } from 'antd'
import { sumBy }                   from 'lodash'

import { CompatibilityDeviceEnum, IncompatibilityFeatures, IncompatibleFeature } from '@acx-ui/rc/utils'

import { FeatureItem }   from './FeatureItem'
import { StyledWrapper } from './styledComponents'

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

  const isConnectedBlock = isCrossDeviceType && deviceType === CompatibilityDeviceEnum.SWITCH

  const getFeatures = (items: IncompatibleFeature[]) => {
    const isMultipleFeatures = items.length > 1
    return items?.reduce((acc: IncompatibleFeature[], cur: IncompatibleFeature) => {
      if (cur.children) {
        return [...acc, ...cur.children]
      }
      return [...acc, cur]
    }, []).map((itemDetail) => {
      const incompatible = sumBy(itemDetail.incompatibleDevices, (d) => d.count)

      return <FeatureItem
        key={itemDetail.featureName}
        isMultiple={!featureName || isMultipleFeatures}
        deviceType={deviceType}
        data={itemDetail}
        incompatible={incompatible}
        total={totalDevices}
        hasBackgroundColor={isConnectedBlock}
      />
    })
  }

  return (
    <Row>
      <Col span={24}>
        {description && <Form.Item>
          {description}
        </Form.Item>}
        <StyledWrapper
          direction='vertical'
          split={<Divider style={{ margin: isConnectedBlock ? 0 : '10px 0' }} />}
          size={0}
        >
          {getFeatures(data)}
        </StyledWrapper>
      </Col>
    </Row>
  )
}
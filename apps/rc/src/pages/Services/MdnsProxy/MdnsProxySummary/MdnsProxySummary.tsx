import { useContext } from 'react'

import { Col, Form, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsFormLegacy, Subtitle }     from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { MdnsProxyForwardingRulesTable } from '@acx-ui/rc/components'
import { MdnsProxyFeatureTypeEnum }      from '@acx-ui/rc/utils'

import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

import { MdnsProxySummaryVenues } from './MdnsProxySummaryVenue'

export function MdnsProxySummary () {
  const { currentData } = useContext(MdnsProxyFormContext)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const totalApCount = (currentData.scope ?? []).reduce((accumulator, currentValue) => {
    return accumulator + currentValue.aps.length
  }, 0)

  const { $t } = useIntl()

  return (
    <>
      <StepsFormLegacy.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsFormLegacy.Title>
      <Space direction='vertical' size='middle'>
        <Row gutter={[24, 8]}>
          <Col span={24}>
            <Subtitle level={4}>{ $t({ defaultMessage: 'Settings' }) }</Subtitle>
          </Col>
          <Col span={12}>
            <Form.Item
              label={$t({ defaultMessage: 'Service Name:' })}
              children={currentData.name}
            />
          </Col>
          <Col span={20}>
            <Form.Item
              label={$t({ defaultMessage: 'Forwarding Rules:' })}
            >
              <MdnsProxyForwardingRulesTable
                featureType={MdnsProxyFeatureTypeEnum.WIFI}
                readonly={true}
                rules={currentData.rules}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Subtitle level={4}>
              { $t({ defaultMessage: '<VenuePlural></VenuePlural> & APs ({apCount})' },
                { apCount: totalApCount }) }
            </Subtitle>
          </Col>
          <Col span={14}>
            <MdnsProxySummaryVenues scope={currentData.scope ?? []} />
          </Col>
        </Row>
      </Space>
    </>
  )
}

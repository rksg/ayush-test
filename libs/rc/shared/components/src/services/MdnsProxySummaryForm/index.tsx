import { Col, Form, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsFormLegacy, Subtitle } from '@acx-ui/components'
import {
  ApMdnsProxyScopeData,
  EdgeMdnsProxyScopeData,
  MdnsProxyFeatureTypeEnum,
  NewMdnsProxyForwardingRule
} from '@acx-ui/rc/utils'

import { MdnsProxyForwardingRulesTable } from '../MdnsProxyForwardingRulesTable'

import { MdnsProxySummaryVenues } from './MdnsProxySummaryVenue'

interface MdnsProxySummaryProps {
  featureType: MdnsProxyFeatureTypeEnum,
  name: string,
  rules: NewMdnsProxyForwardingRule[],
  scope: (ApMdnsProxyScopeData | EdgeMdnsProxyScopeData)[]
}

export const MdnsProxySummaryForm = (props: MdnsProxySummaryProps) => {
  const { $t } = useIntl()
  const { featureType, name, rules, scope } = props

  const deviceCount = scope.reduce((accumulator, currentValue) => {
    return accumulator + ((featureType === MdnsProxyFeatureTypeEnum.EDGE
      ? (currentValue as EdgeMdnsProxyScopeData).edgeClusters
      : (currentValue as ApMdnsProxyScopeData).aps)?.length ?? 0)
  }, 0)

  return (
    <>
      <Row>
        <Col span={24}>
          <StepsFormLegacy.Title>
            { $t({ defaultMessage: 'Summary' }) }
          </StepsFormLegacy.Title>
        </Col>
      </Row>
      <Space direction='vertical' size='middle'>
        <Row gutter={[24, 8]}>
          <Col span={24}>
            <Subtitle level={4}>{ $t({ defaultMessage: 'Settings' }) }</Subtitle>
          </Col>
          <Col span={12}>
            <Form.Item
              label={$t({ defaultMessage: 'Service Name:' })}
              children={name}
            />
          </Col>
          <Col span={20}>
            <Form.Item
              label={$t({ defaultMessage: 'Forwarding Rules:' })}
            >
              <MdnsProxyForwardingRulesTable
                featureType={featureType}
                readonly
                rules={rules}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Subtitle level={4}>
              {
                // eslint-disable-next-line max-len
                $t({ defaultMessage: '<VenuePlural></VenuePlural> & {featureType} ({deviceCount})' },
                  {
                    featureType: featureType === MdnsProxyFeatureTypeEnum.EDGE
                      ? $t({ defaultMessage: 'RUCKUS Edge Clusters' })
                      : $t({ defaultMessage: 'APs' }),
                    deviceCount
                  })
              }
            </Subtitle>
          </Col>
          <Col span={14}>
            <MdnsProxySummaryVenues featureType={featureType} scope={scope ?? []} />
          </Col>
        </Row>
      </Space>
    </>
  )
}

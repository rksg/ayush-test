import { useContext } from 'react'

import { Col, Form, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm, Subtitle }           from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable } from '@acx-ui/rc/components'

import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

import { MdnsProxySummaryVenues } from './MdnsProxySummaryVenue'

export function MdnsProxySummary () {
  const { currentData } = useContext(MdnsProxyFormContext)
  const totalApCount = (currentData.scope ?? []).reduce((accumulator, currentValue) => {
    return accumulator + currentValue.aps.length
  }, 0)

  const { $t } = useIntl()

  return (
    <>
      <StepsForm.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsForm.Title>
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
                readonly={true}
                rules={currentData.rules}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Venues & APs ({apCount})' }, { apCount: totalApCount }) }
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

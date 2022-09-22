import { useContext } from 'react'

import { Col, Form, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm, Subtitle } from '@acx-ui/components'
import { MdnsProxyScopeData }  from '@acx-ui/rc/utils'

import MdnsProxyFormContext              from '../MdnsProxyForm/MdnsProxyFormContext'
import { MdnsProxyForwardingRulesTable } from '../MdnsProxyForm/MdnsProxyForwardingRulesTable'

export function MdnsProxySummary () {
  const { currentData } = useContext(MdnsProxyFormContext)
  const apCount = (currentData.scope ?? []).reduce((accumulator, currentValue) => {
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
          <Col span={8}>
            <Form.Item
              label={$t({ defaultMessage: 'Service Name' })}
              children={currentData.name}
            />
          </Col>
          <Col span={8}>
            <Form.Item
              label={$t({ defaultMessage: 'Tags' })}
              children={currentData.tags}
            />
          </Col>
          <Col span={16}>
            <Form.Item
              label={$t({ defaultMessage: 'Forwarding Rules' })}
            >
              <MdnsProxyForwardingRulesTable
                readonly={true}
                rules={currentData.forwardingRules}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Venues & APs ({apCount})' }, { apCount }) }
            </Subtitle>
          </Col>
          <Col span={10}>
            <MdnsProxySummaryVenues scope={currentData.scope ?? []} />
          </Col>
        </Row>
      </Space>
    </>
  )
}

export function MdnsProxySummaryVenues (props: { scope: MdnsProxyScopeData[] }) {
  const { scope } = props
  const { $t } = useIntl()

  return (
    <div>
      <Space direction='vertical' size={4}>
        {scope.map((scopeData: MdnsProxyScopeData) => {
          return (
            <div key={scopeData.venueId}>
              <Space>
                <span>{scopeData.venueName}</span>
                <span>
                  ({scopeData.aps.length === 1
                    ? scopeData.aps[0].name
                    : $t({ defaultMessage: '{apCount} APs' }, { apCount: scopeData.aps.length })
                  })
                </span>
              </Space>
            </div>
          )
        })}
      </Space>
    </div>
  )
}

import React, { useContext } from 'react'

import { Form, Col, Row, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { StepsForm, Subtitle } from '@acx-ui/components'

import SyslogContext from '../SyslogContext'

const SyslogSummaryForm = () => {
  const { Paragraph } = Typography

  const { $t } = useIntl()

  const {
    state
  } = useContext(SyslogContext)

  return (
    <Row gutter={20}>
      <Col span={18}>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
        <Row>
          <Col span={24}>
            <Subtitle level={4}>{ $t({ defaultMessage: 'Settings' }) }</Subtitle>
          </Col>
          <Col span={6}>
            <Form.Item
              name='policyName'
              label={$t({ defaultMessage: 'Policy Name' })}
            >
              <Paragraph>{state.policyName.toString()}</Paragraph>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name='server'
              label={$t({ defaultMessage: 'Primary Server' })}
            >
              <Paragraph>
                {`${state.server?.toString()}
                :${state.port?.toString()} ${state.protocol?.toString()}`}
              </Paragraph>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name='secondaryServer'
              label={$t({ defaultMessage: 'Secondary Server' })}
            >
              <Paragraph>
                {`${state.secondaryServer?.toString()}
                :${state.secondaryPort?.toString()} ${state.secondaryProtocol?.toString()}`}
              </Paragraph>
            </Form.Item>
          </Col>
          <Col span={6}>
          </Col>
          <Col span={6}>
            <Form.Item
              name='facility'
              label={$t({ defaultMessage: 'Event Facility' })}
            >
              <Paragraph>{state.facility?.toString()}</Paragraph>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name='flowLevel'
              label={$t({ defaultMessage: 'Send Logs' })}
            >
              <Paragraph>{state.flowLevel?.toString()}</Paragraph>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Subtitle level={4}>{
              $t({ defaultMessage: 'Venues ({count})' }, { count: state.venues.length })
            }</Subtitle>
          </Col>
          <Col span={6}>
            <Form.Item
              name='venueNameList'
            >
              <>
                {state.venues.map(venue => {
                  return <div key={venue.name}>{venue.name}</div>
                })}
              </>
            </Form.Item>
          </Col>
        </Row>
      </Col>

      <Col span={14}>
      </Col>
    </Row>
  )
}

export default SyslogSummaryForm

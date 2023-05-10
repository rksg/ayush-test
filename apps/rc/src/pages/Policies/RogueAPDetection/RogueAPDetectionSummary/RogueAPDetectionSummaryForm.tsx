import React, { useContext } from 'react'

import { Form, Col, Row, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { StepsFormLegacy, Subtitle } from '@acx-ui/components'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

const RogueAPDetectionSummaryForm = () => {
  const { Paragraph } = Typography

  const { $t } = useIntl()

  const {
    state
  } = useContext(RogueAPDetectionContext)

  return (
    <Row gutter={20}>
      <Col span={18}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Summary' })}</StepsFormLegacy.Title>
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
              name='description'
              label={$t({ defaultMessage: 'Description' })}
            >
              <Paragraph>{state.description.toString()}</Paragraph>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name='classification'
              label={$t({ defaultMessage: 'Classification Rules' })}
            >
              <Paragraph>{state.rules.length}</Paragraph>
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

export default RogueAPDetectionSummaryForm

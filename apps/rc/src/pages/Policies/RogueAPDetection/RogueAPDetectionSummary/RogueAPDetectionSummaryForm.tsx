import { useContext } from 'react'

import { Form, Col, Row, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { StepsForm, Subtitle } from '@acx-ui/components'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

const RogueAPDetectionSummaryForm = () => {
  const { Paragraph } = Typography

  const { $t } = useIntl()

  const {
    state
  } = useContext(RogueAPDetectionContext)

  console.log('render in summary, state: ')
  console.log(state)

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
              name='tags'
              label={$t({ defaultMessage: 'Tags' })}
            >
              <Paragraph>{state.tags?.join(', ')}</Paragraph>
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
              $t({ defaultMessage: 'Venues' }) + `(${state.venues.length})`
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

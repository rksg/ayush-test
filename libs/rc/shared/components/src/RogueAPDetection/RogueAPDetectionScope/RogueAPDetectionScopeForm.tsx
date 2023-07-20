import { Form, Col, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm }                  from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

import { RogueVenueTable } from './RogueVenueTable'

const VenueSelectInfo = () => {
  const { $t } = useIntl()
  return <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr' }}>
    <QuestionMarkCircleOutlined/>
    <Space wrap size={8} >
      {/* eslint-disable-next-line max-len */}
      {$t({ defaultMessage: 'If Rogue AP Detection is OFF for a venue and you activate a policy, Rogue detection will be turned ON for the venue automatically.' })}
    </Space>
    <QuestionMarkCircleOutlined/>
    <Space wrap size={8} >
      {/* eslint-disable-next-line max-len */}
      {$t({ defaultMessage: 'Only 1 rogue AP classification profile can be active at any venue at any time.' })}
    </Space>
  </div>
}

export const RogueAPDetectionScopeForm = () => {
  const { $t } = useIntl()

  return (
    <Row gutter={20}>
      <Col span={15}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>

        <Form.Item
          name='venueTable'
          label={$t({ defaultMessage:
              'Select the venues where the rogue AP detection policy will be applied:' })}
        >
          <VenueSelectInfo />
          <RogueVenueTable />
        </Form.Item>

      </Col>

      <Col span={5}>
      </Col>
    </Row>
  )
}

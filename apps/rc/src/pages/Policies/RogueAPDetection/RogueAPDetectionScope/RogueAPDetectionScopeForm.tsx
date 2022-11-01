import { Form, Col, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import RogueVenueTable from './RogueVenueTable'

type RogueAPDetectionScopeFormProps = {
  edit: boolean
}

const RogueAPDetectionScopeForm = (props: RogueAPDetectionScopeFormProps) => {
  const { $t } = useIntl()
  const { edit } = props

  return (
    <Row gutter={20}>
      <Col span={15}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>

        <Form.Item
          name='venueTable'
          label={$t({ defaultMessage:
              'Select the venues where the rogue AP detection policy will be applied:' })}
        >
          <RogueVenueTable edit={edit} />
        </Form.Item>

      </Col>

      <Col span={5}>
      </Col>
    </Row>
  )
}

export default RogueAPDetectionScopeForm

import { Form, Col, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import RougeVenueTable from './RougeVenueTable'

type RougeAPDetectionScopeFormProps = {
  edit: boolean
}

const RougeAPDetectionScopeForm = (props: RougeAPDetectionScopeFormProps) => {
  const { $t } = useIntl()
  const { edit } = props

  return (
    <Row gutter={20}>
      <Col span={15}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>

        <Form.Item
          name='venueTable'
          label={$t({ defaultMessage:
              'Select the venues where the rouge AP detection policy will be applied:' })}
        >
          <RougeVenueTable edit={edit} />
        </Form.Item>

      </Col>

      <Col span={5}>
      </Col>
    </Row>
  )
}

export default RougeAPDetectionScopeForm

import { Col, Form, InputNumber, Row, Select, Space } from 'antd'
import { useIntl }                                    from 'react-intl'
import { useParams }                                  from 'react-router-dom'

import { StepsForm, useStepFormContext, Subtitle }              from '@acx-ui/components'

import { FirewallForm } from '..'


export const SummaryForm = () => {

  const { $t } = useIntl()
  const { form } = useStepFormContext<FirewallForm>()


  return (
    <Row gutter={20}>
      <Col>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>

        <Subtitle level={4}>
          { $t({ defaultMessage: 'Settings' }) }
        </Subtitle>

        <Subtitle level={4}>
          { $t({ defaultMessage: 'SmartEdge' }) }
        </Subtitle>

      </Col>
    </Row>
  )
}


import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm } from '@acx-ui/components'

// import { FirewallForm } from '..'


export const ScopeForm = () => {
  const { $t } = useIntl()
  // const params = useParams()
  // const { form } = useStepFormContext<FirewallForm>()

  return (
    <Row gutter={20}>
      <Col span={8}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>
      </Col>
    </Row>
  )
}

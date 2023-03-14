import { Col, Form, Input, Row, Select } from 'antd'
import { useIntl }                       from 'react-intl'

import { StepsForm, Subtitle } from '@acx-ui/components'

// import { FirewallForm } from '..'

interface SettingsFormProps {
  editMode?: boolean
}

export const SettingsForm = (props: SettingsFormProps) => {
  const { $t } = useIntl()
  // const { tenantId } = useParams()
  // const { form } = useStepFormContext<FirewallForm>()


  return (
    <>
      <Row gutter={20}>
        <Col span={8}>
          <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
          <Form.Item
            name='serviceName'
            label={$t({ defaultMessage: 'Service Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
          <Form.Item
            name='tags'
            label={$t({ defaultMessage: 'Tags' })}
            children={<Select mode='tags' />}
          />
        </Col>
      </Row>
      <Row gutter={20}>
        <Subtitle level={4}>
          { $t({ defaultMessage: 'Set Firewall Settings' }) }
        </Subtitle>
      </Row>
    </>
  )
}

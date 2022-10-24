import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import PortalDemo from '../PortalDemo/PortalDemo'


const PortalSettingForm = () => {
  const { $t } = useIntl()
  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
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
        </Col>
      </Row>
      <Row>
        <Col flex={1}>
          <Form.Item
            name='demo'
            label={$t({ defaultMessage: 'Demo' })}
            children={<PortalDemo/>}
          />
        </Col>
      </Row>
    </>
  )
}

export default PortalSettingForm

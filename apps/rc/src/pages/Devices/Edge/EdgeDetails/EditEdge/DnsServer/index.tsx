import { useRef } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import {
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { EdgeSaveData } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'



const DnsServer = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge/list')
  const formRef = useRef<StepsFormInstance<EdgeSaveData>>()
  const handleApplyDns = async (data: EdgeSaveData) => {}

  return (
    <StepsForm
      formRef={formRef}
      onFinish={handleApplyDns}
      onCancel={() => navigate(linkToEdgeList)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply DNS Server' }) }}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={5}>
            <Form.Item
              name='venueId'
              label={$t({ defaultMessage: 'Primary DNS Server' })}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Secondary DNS Server' })}
              children={<Input />}
            />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>

  )
}

export default DnsServer
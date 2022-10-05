import React from 'react'

import { Row, Col, Form, Input } from 'antd'

import {
  PageHeader,
  showToast,
  StepsForm
} from '@acx-ui/components'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function AddMspEc () {
  const navigate = useNavigate()
  const linkToCustomers = useTenantLink('/dashboard/mspcustomers', 'v')

  return (
    <>
      <PageHeader
        title='Add Customer Account'
        breadcrumb={[
          { text: 'MSP Customers', link: '/dashboard/mspcustomers', tenantType: 'v' }
        ]}
      />
      <StepsForm
        onCancel={() => navigate(linkToCustomers, { replace: true })}
        onFinish={async () => {
          await wait(1000) // mimic external service call
          showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
          navigate(linkToCustomers, { replace: true })
        }}
        buttonLabel={{ submit: 'Add' }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item name='field1' label='Field 1'>
                <Input />
              </Form.Item>
              <Form.Item name='field2' label='Field 2'>
                <Input />
              </Form.Item>
              <Form.Item name='field3' label='Field 3'>
                <Input />
              </Form.Item>
              <Form.Item name='field4' label='Field 4'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

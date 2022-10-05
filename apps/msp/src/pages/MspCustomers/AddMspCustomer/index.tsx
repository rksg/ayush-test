import React from 'react'

import { Row, Col, Form, Input, Divider } from 'antd'

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

export function AddMspCustomer () {
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
              <h3>Account Detail</h3>
              <Form.Item
                name='field1'
                label='Customer Account Name'
                rules={[
                  { required: true }
                ]}>
                <Input />
              </Form.Item>
              <Form.Item name='field2' label='Address'>
                <Input />
              </Form.Item>
              <Form.Item name='field3' label='MSP Administrators'>
                <Input />
              </Form.Item>
              <Divider></Divider>
              <h3>Subscriptions</h3>
              <Form.Item name='field4' label='Assigned Wi-Fi Subscriptions'>
                <Input />
              </Form.Item>
              <Form.Item name='field4' label='Assigned Switch Subscriptions'>
                <Input />
              </Form.Item>
              <Form.Item name='field4' label='Service Start Date'>
                <Input />
              </Form.Item>
              <Form.Item name='field4' label='Service Expiration Date'>
                <Input />
              </Form.Item>
              <Divider></Divider>
              <h3>Customer Administrator</h3>
              <Form.Item name='field1' label='Email'>
                <Input />
              </Form.Item>
              <Form.Item name='field2' label='Name'>
                <Input />
              </Form.Item>
              <Form.Item name='field3' label='Admin Role'>
                <Input />
              </Form.Item>

            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

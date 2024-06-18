import React, { useEffect, useState } from 'react'

import { Row, Col, Form, Input, Space, Switch } from 'antd'

import { StepsForm, useStepFormContext } from '..'
import { showToast }                     from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

const Step2 = () => {
  const { form, editMode } = useStepFormContext()

  useEffect(() => {
    if (editMode)
      form.validateFields()
  }, [])

  return <Row gutter={20}>
    <Col span={10}>
      <StepsForm.Title children='Step 2' />
      <Form.Item name='field3'
        label='Field 3'
        rules={[
          { required: true }
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name='field4' label='Field 4'>
        <Input />
      </Form.Item>
    </Col>
  </Row>
}

export function GotoStep () {
  const [editMode, setEditMode] = useState(false)

  return (
    <>
      <Space>
        <div>EditMode: </div>
        <Switch onClick={(val) => setEditMode(val)} />
      </Space>
      <StepsForm
        editMode={editMode}
        onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
        onFinish={async (v: Record<string, unknown>, gotoStep) => {
          if (!v.field3)
            gotoStep(1)
          else {
            alert('aaa')
            await wait(1000) // mimic external service call
            showToast({ type: 'success', content: 'Submitted' })
          }
        }}
      >
        <StepsForm.StepForm name='step1' title='Step 1'>
          <Row gutter={20}>
            <Col span={10}>
              <StepsForm.Title children='Step 1' />
              <Form.Item name='field1'
                label='Field 1'
                rules={[
                  { required: true }
                  // { validator: remoteValidation, message: 'Value in use' }
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item name='field2' label='Field 2'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Step 2'>
          <Step2/>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Step 3'>
          <Row gutter={20}>
            <Col span={10}>
              <StepsForm.Title children='Step 3' />
              <Form.Item name='field5' label='Field 5'>
                <Input />
              </Form.Item>
              <Form.Item name='field7' label='Field 6'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
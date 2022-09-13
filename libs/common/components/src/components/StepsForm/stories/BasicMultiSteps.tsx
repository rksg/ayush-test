import React from 'react'

import { Row, Col, Form, Input, Select } from 'antd'

import { StepsForm } from '..'
import { showToast } from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function BasicMultiSteps () {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm
          onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
          onFinish={async () => {
            await wait(1000) // mimic external service call
            showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
          }}
        >
          <StepsForm.StepForm title='Step 1'>
            <StepsForm.Title children='Step 1' />
            <Form.Item name='field1' label='Field 1'>
              <Input />
            </Form.Item>
            <Form.Item name='field2' label='Field 2'>
              <Select>
                <Select.Option value='option1'>Option 1</Select.Option>
                <Select.Option value='option2'>Option 2</Select.Option>
                <Select.Option value='option3'>Option 3</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name='field3' label='Field 3'>
              <Select disabled>
                <Select.Option value='option1'>Option 1</Select.Option>
                <Select.Option value='option2'>Option 2</Select.Option>
                <Select.Option value='option3'>Option 3</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name='field4' label='Field 4'>
              <Input disabled />
            </Form.Item>
            <Form.Item name='field5' label='Field 5'>
              <Input />
            </Form.Item>
            <Form.Item name='field6' label='Field 6'>
              <Input />
            </Form.Item>
            <Form.Item name='field7' label='Field 7'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm>

          <StepsForm.StepForm title='Step 2'>
            <StepsForm.Title children='Step 2' />
            <Form.Item name='field8' label='Field 8'>
              <Input />
            </Form.Item>
            <Form.Item name='field9' label='Field 9'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm>
        </StepsForm>
      </Col>
    </Row>
  )
}

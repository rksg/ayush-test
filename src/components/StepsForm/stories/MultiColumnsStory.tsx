import React                              from 'react'
import { message, Form, Input, Row, Col } from 'antd'
import { StepsForm }                      from '..'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function MultiColumnsStory () {
  return <StepsForm
    editMode
    onCancel={() => message.info('Cancel')}
    onFinish={async () => {
      await wait(1000) // mimic external service call
      message.success('Submitted') // show notification to indicate submission successful
    }}
  >
    <StepsForm.StepForm title='Step 1'>
      <StepsForm.Title children='Step 1' />
      <Form.Item name='field1' label='Field 1'>
        <Input />
      </Form.Item>
      <Form.Item name='field2' label='Field 2'>
        <Input />
      </Form.Item>
    </StepsForm.StepForm>

    <StepsForm.StepForm title='Step 2'>
      <StepsForm.Title children='Step 2' />
      <Form.Item name='field3' label='Field 3'>
        <Input />
      </Form.Item>
      <Form.Item name='field4' label='Field 4'>
        <Input />
      </Form.Item>
    </StepsForm.StepForm>

    <StepsForm.StepForm title='Step 3'>
      <StepsForm.Title children='Step 3' />
      <Form.Item name='field5' label='Field 5'>
        <Input />
      </Form.Item>
      <Form.Item name='field7' label='Field 6'>
        <Input />
      </Form.Item>
    </StepsForm.StepForm>

    <StepsForm.StepForm>
      <Row gutter={20}>
        <Col md={12} span={24}>
          <StepsForm.Title children='Summary' />
          <p>Summary</p>
        </Col>
        <Col md={12} span={24}>
          <StepsForm.Title children='Advanced Settings' />
          <Form.Item name='a-field1' label='Additional Field 1'>
            <Input />
          </Form.Item>
          <Form.Item name='a-field2' label='Additional Field 2'>
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </StepsForm.StepForm>
  </StepsForm>
}

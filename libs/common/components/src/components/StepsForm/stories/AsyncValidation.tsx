import React from 'react'

import { Row, Col, Form, Input } from 'antd'
import { RuleObject }            from 'antd/lib/form'

import { StepsForm } from '..'
import { showToast } from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

interface Fields {
  field1: string
  field2: string
  field3: string
  field4: string
}

export function AsyncValidation () {
  const remoteValidation = async (rule: RuleObject, value: string) => {
    await wait(1000) // mimic external request
    if (value === 'value') throw new Error(rule.message?.toString())
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm<Fields>
          onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
          onFinish={async (data) => {
            console.log(data) // eslint-disable-line
            showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
          }}
        >
          <StepsForm.StepForm<Pick<Fields, 'field1' | 'field2'>>
            title='Step 1'
            onFinish={async (data) => {
              console.log(data) // eslint-disable-line
              await wait(1000) // mimic external service call
              return true // return true to continue to next step
            }}
          >
            <StepsForm.Title children='Step 1' />
            <Form.Item
              name='field1'
              label='Field 1'
              extra='Enter "value" to trigger validation error'
              // rules uses https://github.com/yiminghe/async-validator behind the scene
              rules={[
                { required: true },
                { validator: remoteValidation, message: 'Value in use' }
              ]}
              // validate rules 1 by 1 to avoid calling external validation service unnecessarily
              validateFirst
              // show loading icon while promise is in progress and check icon after
              hasFeedback
            >
              <Input />
            </Form.Item>
            <Form.Item name='field2' label='Field 2'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm>

          <StepsForm.StepForm<Pick<Fields, 'field1' | 'field2'>>
            title='Step 2'
            onFinish={async (data) => {
              console.log(data) // eslint-disable-line
              await wait(1000)
              return true
            }}
          >
            <StepsForm.Title children='Step 2' />
            <Form.Item name='field3' label='Field 3'>
              <Input />
            </Form.Item>
            <Form.Item name='field4' label='Field 4'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm>
        </StepsForm>
      </Col>
    </Row>
  )
}

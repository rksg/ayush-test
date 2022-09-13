import React, { useState } from 'react'

import { Row, Col, Form, Input } from 'antd'

import { Button }    from '../../Button'
import { StepsForm } from '../../StepsForm'
import { showToast } from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function DynamicSteps () {
  const [show, setShow] = useState(false)
  const [showMore, setShowMore] = useState(false)
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
          <StepsForm.StepForm title={show ? 'Step 1' : 'Step 1 no Step 3'} name='step-1'>
            <StepsForm.Title children='Step 1' />
            <Form.Item name='field1' label='Field 1'>
              <Input />
            </Form.Item>
            <Button onClick={() => setShow(!show)}>Toggle Step</Button>
          </StepsForm.StepForm>

          <StepsForm.StepForm title='Step 2' name='step-2'>
            <StepsForm.Title children='Step 2' />
            <Form.Item name='field2' label='Field 2'>
              <Input />
            </Form.Item>
            <Button onClick={() => setShowMore(!showMore)}>Toggle More Step</Button>
          </StepsForm.StepForm>

          {show ? <StepsForm.StepForm title='Step 3' name='step-3'>
            <StepsForm.Title children='Step 3' />
            <Form.Item name='field3' label='Field 3'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm> : null}

          <StepsForm.StepForm title='Step 4' name='step-4'>
            <StepsForm.Title children='Step 4' />
            <Form.Item name='field4' label='Field 4'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm>

          {showMore ? <StepsForm.StepForm title='Step 5' name='step-5'>
            <StepsForm.Title children='Step 5' />
            <Form.Item name='field5' label='Field 5'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm> : null}
        </StepsForm>
      </Col>
    </Row>
  )
}

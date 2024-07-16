import React from 'react'

import { Row, Col, Typography, Form, Input, Checkbox } from 'antd'

import { StepsForm } from '..'
import { showToast } from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function TextContent () {
  return (
    <StepsForm
      onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
      onFinish={async () => {
        await wait(1000) // mimic external service call
        showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
      }}
      buttonLabel={{ submit: 'Add' }}
    >
      <StepsForm.StepForm title='Step 1'>
        <Row gutter={20}>
          <Col span={10}>
            <StepsForm.Title children='Step 1' />
            <StepsForm.Subtitle>
              Subtitle
            </StepsForm.Subtitle>
            <StepsForm.TextContent>
              <Typography.Paragraph>{
                // eslint-disable-next-line max-len
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
              }</Typography.Paragraph>
            </StepsForm.TextContent>
            <Form.Item name='field1' label='Field 1'>
              <Input />
            </Form.Item>
            <StepsForm.Subtitle>
              Another Subtitle
            </StepsForm.Subtitle>
            <StepsForm.TextContent>
              <Form.Item>
                <Checkbox>
                  Lorem ipsum dolor sit amet
                </Checkbox>
              </Form.Item>
              <Typography.Paragraph className='indent greyText'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Typography.Paragraph>
            </StepsForm.TextContent>
          </Col>
        </Row>
      </StepsForm.StepForm>

      <StepsForm.StepForm title='Step 2'>
        <Row gutter={20}>
          <Col span={10}>
            <StepsForm.Title children='Step 2' />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

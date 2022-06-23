import React from 'react'

import { Form, Input } from 'antd'

import { StepsForm } from '..'
import { showToast } from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function EditModeStory () {
  return <div style={{ marginTop: 80 }}>
    <StepsForm
      editMode
      onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
      onFinish={async () => {
        await wait(1000) // mimic external service call
        showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
      }}
    >
      <StepsForm.StepForm name='step1' title='Step 1'>
        <StepsForm.Title children='Step 2' />
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
    </StepsForm>
  </div>
}

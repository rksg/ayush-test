import { useState } from 'react'

import { Row, Col, Form, Input, Button } from 'antd'

import { StepsForm } from '..'
import { Drawer }    from '../../Drawer'
import { showToast } from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function AlertMessageBar () {
  const [visible, setVisible] = useState(false)

  return <><StepsForm
    onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
    onFinish={async () => {
      await wait(1000) // mimic external service call
      showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
    }}
    buttonLabel={{
      submit: 'Add & Finish',
      apply: 'Apply & Finish'
    }}
    customSubmit={{
      label: 'Apply & Continue',
      onFinish: async () => {
        await wait(1000)
        showToast({ type: 'success', content: 'customSubmitButton submitted' })
      }
    }}
  >
    <StepsForm.StepForm
      name='step1'
      title='Step 1'
      alert={{
        type: 'success',
        message: 'Pass!'
      }}>
      <Row gutter={20}>
        <Col span={10}>
          <StepsForm.Title children='Step 1' />
          <Form.Item name='field1' label='Field 1'>
            <Input />
          </Form.Item>
          <Form.Item name='field2' label='Field 2'>
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </StepsForm.StepForm>

    <StepsForm.StepForm
      title='Step 2'
      alert={{
        type: 'info',
        message: <div>
          Some Information
          <Button type='link' onClick={() => setVisible(true)}>
            More details
          </Button>
        </div>
      }}
    >
      <Row gutter={20}>
        <Col span={10}>
          <StepsForm.Title children='Step 2' />
          <Form.Item name='field3' label='Field 3'>
            <Input />
          </Form.Item>
          <Form.Item name='field4' label='Field 4'>
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </StepsForm.StepForm>

    <StepsForm.StepForm
      title='Step 3'
      alert={{
        type: 'warning',
        message: 'A Warning'
      }}
    >
      <Row gutter={20}>
        <Col span={10}>
          <StepsForm.Title children='Step 3' />
          <Form.Item name='field5' label='Field 5'>
            <Input />
          </Form.Item>
          <Form.Item name='field6' label='Field 6'>
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </StepsForm.StepForm>
    <StepsForm.StepForm
      title='Step 3'
      alert={{
        type: 'error',
        message: 'Unmatched'
      }}
    >
      <Row gutter={20}>
        <Col span={10}>
          <StepsForm.Title children='Step 4' />
          <Form.Item name='field8' label='Field 8'>
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </StepsForm.StepForm>
  </StepsForm>
  <Drawer
    title='More Details'
    visible={visible}
    onClose={() => setVisible(false)}
  >
    More details about the information alert message.
  </Drawer>
  </>
}
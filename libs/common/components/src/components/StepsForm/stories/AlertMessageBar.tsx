import { useState } from 'react'

import { Row, Col, Form, Input, Button, AlertProps } from 'antd'

import { StepsForm, StepsFormProps } from '..'
import { Drawer }                    from '../../Drawer'
import { showToast }                 from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function AlertMessageBar () {
  const [visible, setVisible] = useState(false)
  const [alertData, setAlertData] = useState<
  StepsFormProps<Record<string, unknown>>['alert'] | undefined>(undefined)
  const [form] = Form.useForm()

  const crossValidation = async (): Promise<Record<string, unknown> | undefined>=> {
    return {
      type: 'error',
      data: [{
        field1: '1',
        field2: 'LAN'
      }]
    }
  }

  return <>
    <StepsForm
      form={form}
      onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
      onFinish={async () => {
        await wait(1000) // mimic external service call
        showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
      }}
      buttonLabel={{
        submit: 'Add & Finish',
        apply: 'Apply & Finish'
      }}
      alert={alertData}
    >
      <StepsForm.StepForm name='step1'
        title='Step 1'
        onFinish={async () => {
          const errors = form.getFieldsError()
          const hasErrors = errors.some((field) => field.errors.length > 0)
          const crossCheckResult = await crossValidation()
          // mock cross checking failed
          if (!hasErrors && crossCheckResult) {
            setAlertData({
              type: crossCheckResult.type as AlertProps['type'],
              message: <div>
                {JSON.stringify(crossCheckResult.data)}
                <Button type='link' onClick={() => setVisible(true)}>
                  More details
                </Button>
              </div>
            })
            return false
          } else {
            setAlertData(undefined)
            return true
          }
        }}>
        <Row gutter={20}>
          <Col span={10}>
            <StepsForm.Title children='Step 1' />
            <Form.Item name='field1'
              label='Field 1'
              rules={[
                { required: true }
              ]}>
              <Input />
            </Form.Item>
            <Form.Item name='field2' label='Field 2'>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </StepsForm.StepForm>

      <StepsForm.StepForm title='Step 2'
        onFinish={async () => {
          if (alertData) {
            return false
          } else {
            setAlertData(undefined)
            return true
          }
        }}>
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

      <StepsForm.StepForm title='Step 3'
        onFinish={async () => {
          if (alertData) {
            return false
          } else {
            setAlertData(undefined)
            return true
          }
        }}>
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

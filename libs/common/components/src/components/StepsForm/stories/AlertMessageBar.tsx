import { useState } from 'react'

import { Row, Col, Form, Input, Button, AlertProps, Space, Switch } from 'antd'

import { StepsForm, StepsFormProps, isStepsFormBackStepClicked } from '..'
import { Drawer }                                                from '../../Drawer'
import { showToast }                                             from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function AlertMessageBar () {
  const [visible, setVisible] = useState(false)
  const [mockedCrossCheckStatus, setMockedCrossCheckStatus] = useState<boolean>(false)
  const [alertData, setAlertData] = useState<
  StepsFormProps<Record<string, unknown>>['alert'] | undefined>(undefined)
  const [form] = Form.useForm()

  const crossValidation = async (): Promise<Record<string, unknown> | void> => {
    return mockedCrossCheckStatus
      ? Promise.resolve()
      : Promise.reject({
        type: 'error',
        data: [{
          field1: '1',
          field2: 'LAN'
        }]
      })
  }

  return <>
    <Space>
      <div>Is cross checking with other form passed: </div>
      <Switch onClick={(val) => setMockedCrossCheckStatus(val)} />
    </Space>
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
      <StepsForm.StepForm name='step1' title='Step 1'>
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
        onFinish={async (v: unknown, event?: React.MouseEvent) => {
          const isBackBtn = isStepsFormBackStepClicked(event)
          // no need to block back step when crossValidation failed
          if (isBackBtn) {
            setAlertData(undefined)
            return true
          }

          try {
            await form.validateFields()
            return await crossValidation()
              .then(() => {
                setAlertData(undefined)
                return true
              })
              .catch((errorData) => {
                setAlertData({
                  type: errorData.type as AlertProps['type'],
                  message: <div>
                    {JSON.stringify(errorData.data)}
                    <Button type='link' onClick={() => setVisible(true)}>
                            More details
                    </Button>
                  </div>
                })
                return false
              })
          } catch {
            setAlertData(undefined)
            return false
          }
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
    </StepsForm>
    {alertData && <Drawer
      title='More Details'
      visible={visible}
      onClose={() => setVisible(false)}
    >
      More details about the information alert message.
    </Drawer>
    }
  </>
}
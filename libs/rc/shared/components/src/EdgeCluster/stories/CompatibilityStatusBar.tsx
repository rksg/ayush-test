import { useState } from 'react'

import { Col, Form, Input, Row, Select, Space, Switch, Typography } from 'antd'

import { StepsForm, StepsFormProps, showToast } from '@acx-ui/components'

import { CompatibilityNodeError }                          from '../CompatibilityErrorDetails/types'
import { CompatibilityStatusBar, CompatibilityStatusEnum } from '../CompatibilityStatusBar'

const getFields = () => {
  return [{
    key: 'lags',
    title: 'Number of LAGs',
    render: () => <Typography.Text type='danger' children={1}/>
  }, {
    key: 'corePorts',
    title: 'Number of Core Ports',
    render: () => <Typography.Text children={0}/>
  }, {
    key: 'portType',
    title: 'Port Types',
    render: () => {
      return [{
        label: 'WAN',
        isError: false
      }, {
        label: 'LAN',
        isError: true
      }].map((item, idx) => <Typography.Text
        key={item.label}
        type={item.isError?'danger':undefined}
        children={`${item.label}${idx!==1?', ':''}`}
      />)
    }
  }]
}

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function BasicCompatibilityStatusBar () {
  const [form] = Form.useForm()
  const [mockedCrossCheckStatus, setMockedCrossCheckStatus] = useState<boolean>(false)
  const [alertData, setAlertData] = useState<
  StepsFormProps<Record<string, unknown>>['alert'] | undefined>(undefined)
  const fields = getFields()

  const errorDetails = [{
    nodeId: '123',
    nodeName: 'SE_Node 1',
    errors: {
      lags: 1,
      corePort: 0

    }
  }, {
    nodeId: '321',
    nodeName: 'SE_Node 2',
    errors: {
      corePort: 0
    }
  }] as CompatibilityNodeError[]

  return (
    <>
      <Space>
        <div>Is cross checking passed: </div>
        <Switch onClick={(val) => setMockedCrossCheckStatus(val)} />
      </Space>
      <StepsForm
        form={form}
        onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
        onFinish={async () => {
          await wait(1000) // mimic external service call
          showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
        }}
        alert={alertData}
      >
        <StepsForm.StepForm
          title='Step 1'
          onFinish={async () => {
            try {
              await form.validateFields()
              return await (mockedCrossCheckStatus
                ? Promise.resolve()
                : Promise.reject({
                  type: CompatibilityStatusEnum.FAIL,
                  data: errorDetails
                }))
                .then(() => {
                  setAlertData(undefined)
                  return true
                })
                .catch((erData) => {
                  setAlertData({
                    type: 'error',
                    message: <CompatibilityStatusBar
                      key='step1'
                      fields={fields}
                      type={erData.type}
                      errors={erData.data}
                    />
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
              <Form.Item name='field5'
                label='Field 5'
                rules={[
                  { required: true }
                ]}>
                <Input />
              </Form.Item>
              <Form.Item name='field6' label='Field 6'>
                <Input />
              </Form.Item>
              <Form.Item name='field7' label='Field 7'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Step 2'>
          <Row gutter={20}>
            <Col span={10}>
              <StepsForm.Title children='Step 2' />
              <Form.Item name='field8' label='Field 8'>
                <Input />
              </Form.Item>
              <Form.Item name='field9' label='Field 9'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
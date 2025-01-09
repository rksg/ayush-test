import { Row, Col, Form, Input, List, Typography, Space } from 'antd'

import { StepsForm } from '..'
import { showToast } from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

const data = {
  venuePropertyMgmt: {
    title: 'Property Management',
    steps: [
      'Enable property management at the venue where you intend to segment the identities',
      'Select/ create an identity group associated with a DPSK service in this property'
    ] },
  cluster: {
    title: 'Edge Cluster',
    steps: [
      'Deploy a Edge cluster at the venue where PIN will be activated'
    ] },
  wifi: {
    title: 'Wi-Fi (optional)',
    steps: [
      // eslint-disable-next-line max-len
      'Create and activate DPSK networks at the venue, ensuring they use the selected DPSK service in the property management identity group'
    ] }
}

export function BasicWithPrerequisiteStep () {
  return (
    <StepsForm
      hasPrerequisiteStep
      onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
      onFinish={async () => {
        await wait(1000) // mimic external service call
        showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
      }}
    >
      <StepsForm.StepForm title='Prerequisite Step'>
        <Row gutter={20}>
          <Col span={10}>
            <StepsForm.Title children='Prerequisite' />
            <Space size={30} direction='vertical'>
              {Object.entries(data).map(([typeKey, stepsInfo]) =>
                <List
                  key={typeKey}
                  bordered
                  header={<Typography.Text strong>{stepsInfo.title}</Typography.Text>}
                  dataSource={stepsInfo.steps}
                  renderItem={item => (
                    <List.Item>
                      <Typography.Text>{item}</Typography.Text>
                    </List.Item>
                  )}
                />
              )}
            </Space>
          </Col>
        </Row>
      </StepsForm.StepForm>

      <StepsForm.StepForm title='Step 1'>
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

      <StepsForm.StepForm title='Step 2'>
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
  )
}



import { Col, Form, Input, Row } from 'antd'


import { cssStr } from '@acx-ui/components'

function BasicInformationPage() {
  const [form] = Form.useForm()
  return <div>
    <div style={{
      fontFamily: cssStr('--acx-accent-brand-font'),
      fontSize: '16px',
      fontWeight: 600,
      margin: '0px 0px 10px 85px'
    }}>
      Venue Details
    </div>
    <Form
      style={{ marginLeft: '85px' }}
      form={form}
      layout={'vertical'}
      labelAlign='left'
    >
        <Col span={8}>
          <Form.Item name='venueName' label='Venue Name'
            rules={[
              { required: true }
            ]}>
            <Input onChange={(e) => { }} />
          </Form.Item>
          <Form.Item name='numberOfAp' label='Approx. Number of APs'>
            <Input onChange={(e) => { }} />
          </Form.Item>

          <Form.Item name='numberOfSwitch' label='Approx. Number of Switches'>
            <Input onChange={(e) => { }} />
          </Form.Item>

        </Col>
        <Col span={16}>
          <Form.Item name='description' label='Tell me more about the deployment'>
          <Input.TextArea rows={8}
            placeholder={`For example, the network is to be deployed in an elementary school with about 2,000 students. We will probably need a network for staff, one for students, and perhaps one for visitors.
This description can be as long or as short as you like. But the more you tell me, the better would be my recommendations.`} />
        </Form.Item>
        </Col>

    </Form>



  </div>
}

export default BasicInformationPage

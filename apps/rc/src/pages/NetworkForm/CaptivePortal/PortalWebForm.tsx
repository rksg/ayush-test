import {
  Col,
  Form,
  RadioChangeEvent,
  Row
} from 'antd'

import { StepsForm } from '@acx-ui/components'
  
export function PortalWebForm () {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <PortalWebFormPage />
      </Col>
      <Col span={14}>
      </Col>
    </Row>
  )
}
  
/* eslint-disable */
  const onChange = (e: RadioChangeEvent) => {
    // setSettingStepTitle(e.target.value as NetworkTypeEnum)
  }
  /* eslint-enable */
  
function PortalWebFormPage () {
  return (
    <>
      <StepsForm.Title>Portal Web Page</StepsForm.Title>
      <div style={{ display: 'none' }}>
        <Form.Item
          name={['guestPortal', 'guestPage', 'langCode']}
          label='Display Language'
          initialValue={'en'}
        ></Form.Item>
        <Form.Item
          name={['guestPortal', 'guestPage', 'tagLine']}
          label='Marketing Message'
          initialValue={'Marketing value'}
        ></Form.Item>
        <Form.Item
          name={['guestPortal', 'guestPage', 'termsAndConditions']}
          label='Terms &amp; Conditions'
          initialValue={'T&C value'}
        ></Form.Item>
        <Form.Item
          name={['guestPortal', 'guestPage', 'welcomeMessages']}
          label='Welcome Text'
          initialValue={'Welcome to the Guest Access login page'}
        ></Form.Item>
        <Form.Item
          name={['guestPortal', 'guestPage', 'wifi4Eu']}
          label='Insert WiFi4EU Snippet'
          initialValue={false}
        ></Form.Item>
      </div>
    </>
  )
}
  
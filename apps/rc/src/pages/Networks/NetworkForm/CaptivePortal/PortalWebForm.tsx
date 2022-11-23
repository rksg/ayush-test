import {
  Col,
  Form,
  RadioChangeEvent,
  Row
} from 'antd'
import { useIntl } from 'react-intl'

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
  const intl = useIntl()
  return (
    <>
      <StepsForm.Title>{intl.$t({ defaultMessage: 'Portal Web Page' })}</StepsForm.Title>
      <div style={{ display: 'none' }}>
        <Form.Item
          name={['guestPage', 'langCode']}
          label={intl.$t({ defaultMessage: 'Display Language' })}
          initialValue={'en'}
        ></Form.Item>
        <Form.Item
          name={['guestPage', 'tagLine']}
          label={intl.$t({ defaultMessage: 'Marketing Message' })}
          initialValue={'Marketing value'}
        ></Form.Item>
        <Form.Item
          name={['guestPage', 'termsAndConditions']}
          label={intl.$t({ defaultMessage: 'Terms &amp; Conditions' })}
          initialValue={'T&C value'}
        ></Form.Item>
        <Form.Item
          name={['guestPage', 'welcomeMessages']}
          label={intl.$t({ defaultMessage: 'Welcome Text' })}
          initialValue={'Welcome to the Guest Access login page'}
        ></Form.Item>
        <Form.Item
          name={['guestPage', 'wifi4Eu']}
          label={intl.$t({ defaultMessage: 'Insert WiFi4EU Snippet' })}
          initialValue={false}
        ></Form.Item>
      </div>
    </>
  )
}

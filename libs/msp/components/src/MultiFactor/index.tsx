import { Row, Col, Form, Switch } from 'antd'
import { useIntl }                from 'react-intl'

import {
  StepsForm,
  Subtitle
} from '@acx-ui/components'

import { OtpLabel } from './styledComponents'
import * as UI      from './styledComponents'


export const MultiFactor = () => {
  const { $t } = useIntl()
  return (
    <StepsForm
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
    //   onFinish={async () => handleCancel()}
    //   onCancel={async () => handleCancel()}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Multi-Factor Authentication' }) }</Subtitle>
            <Form.Item style={{ marginTop: '14px' }}
              name='mfa_status'
              label={$t({ defaultMessage: 'Multi-Factor Authentication' })}
              tooltip={$t({ defaultMessage:
                  'This option is controlled by the Prime-Administrator(s) of this account.' +
                  'If they turn it on, you will be able to manage here your authentication ' +
                  'settings' })}
              children={
                <label>Off</label>
              }
            />
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={8}>
            <Subtitle level={5} >
              { $t({ defaultMessage: 'Set authentication method' }) }</Subtitle>
            <StepsForm.FieldLabel width='275px'>
              <OtpLabel>
                {$t({ defaultMessage: 'One Time P6ssword (OTP)' })}
                We will send you a code via SMS or Email
              </OtpLabel>
              <Form.Item
                name='email_format'
                rules={[{
                  required: false
                }]}
                children={<Switch></Switch>}
              />
            </StepsForm.FieldLabel>
            <StepsForm.FieldLabel width='275px'>
              <OtpLabel>
                {$t({ defaultMessage: 'Authentication App' })}
                You’ll receive a login code via an authentication app
              </OtpLabel>
              <Form.Item
                name='email_format'
                rules={[{
                  required: false
                }]}
                children={<Switch></Switch>}
              />
            </StepsForm.FieldLabel>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={8}>
            <Subtitle level={5} style={{ marginTop: '16px' }}>
              { $t({ defaultMessage: 'Backup authentication method' }) }</Subtitle>
            <StepsForm.FieldLabel width='275px'>
              <OtpLabel>
                {$t({ defaultMessage: 'Recovery Codes' })}
                {'User recovery codes to log in if you can’t receive a verification code via ' +
                  'email, SMS, or an auth app'}
              </OtpLabel>
              <Form.Item
                name='email_format'
                rules={[{
                  required: false
                }]}
                children={<UI.FieldTextLink>
                  {$t({ defaultMessage: 'See' })}
                </UI.FieldTextLink>
                }
              />
            </StepsForm.FieldLabel>
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

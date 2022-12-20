import { useEffect, useState } from 'react'

import { Row, Col, Form, Switch } from 'antd'
import { useIntl }                from 'react-intl'

import {
  StepsForm,
  Subtitle
} from '@acx-ui/components'
import {
  useGetMfaTenantDetailsQuery
} from '@acx-ui/rc/services'
import {
  useParams
} from '@acx-ui/react-router-dom'

import { AuthApp }         from './AuthApp'
import { OneTimePassword } from './OneTimePassword'
import { RecoveryCodes }   from './RecoveryCodes'
import { OtpLabel }        from './styledComponents'
import * as UI             from './styledComponents'


export const MultiFactor = () => {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [recoveryCodeVisible, setRecoveryCodeVisible] = useState(false)
  const [authAppVisible, setAuthAppVisible] = useState(false)
  const [otpVisible, setOtpVisible] = useState(false)
  const [mfaStatus, setMfaStatus] = useState('Off')
  const [mfaRecoveryCode, setRecoveryCode] = useState([] as string[])

  const { data } = useGetMfaTenantDetailsQuery({ params: { tenantId } })

  useEffect(() => {
    if (data) {
      setMfaStatus(data.enabled ? 'On' : 'Off')
      setRecoveryCode(data.recoveryCodes ? data.recoveryCodes : [])
    }
  }, [data])

  const AuthenticationMethod = () => {
    return (
      <Row gutter={20}>
        <Col span={8}>
          <Subtitle level={5} >
            { $t({ defaultMessage: 'Set authentication method' }) }</Subtitle>
          <StepsForm.FieldLabel width='275px'>
            <OtpLabel>
              {$t({ defaultMessage: 'One Time Password (OTP)' })}
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
    )
  }

  const BackupAuthenticationMethod = () => {
    return (
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
              children={<UI.FieldTextLink onClick={()=>setRecoveryCodeVisible(true)}>
                {$t({ defaultMessage: 'See' })}
              </UI.FieldTextLink>
              }
            />
          </StepsForm.FieldLabel>
        </Col>
      </Row>
    )
  }

  return (
    <>
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
                  <label>{mfaStatus}</label>
                }
              />
            </Col>
          </Row>
          {mfaStatus === 'On' && <AuthenticationMethod />}
          {mfaStatus === 'On' && <BackupAuthenticationMethod />}
        </StepsForm.StepForm>
      </StepsForm>
      {recoveryCodeVisible &&<RecoveryCodes
        visible={recoveryCodeVisible}
        setVisible={setRecoveryCodeVisible}
        recoveryCode={mfaRecoveryCode}
      />}
      {authAppVisible &&<AuthApp
        visible={authAppVisible}
        setVisible={setAuthAppVisible}
      />}
      {otpVisible &&<OneTimePassword
        visible={otpVisible}
        setVisible={setOtpVisible}
      />}
    </>

  )
}

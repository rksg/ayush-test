import { useEffect, useState } from 'react'

import { Row, Col, Form, Switch } from 'antd'
import { useIntl }                from 'react-intl'

import {
  StepsForm,
  Subtitle
} from '@acx-ui/components'
import {
  useGetMfaAdminDetailsQuery,
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
  const [mfaStatus, setMfaStatus] = useState(false)
  const [mfaRecoveryCode, setRecoveryCode] = useState([] as string[])
  const [mfaUserId, setUserId] = useState('')
  const [mfaSmsToggle, setSmsToggle] = useState(false)
  const [mfaAuthAppToggle, setAuthAppToggle] = useState(false)
  const [contactId, setContactId] = useState('')

  let smsSublabel = 'We will send you a code via SMS or Email'
  const authAppSublabel = 'You’ll receive a login code via an authentication app'

  const { data } = useGetMfaTenantDetailsQuery({ params: { tenantId } })
  const { data: details } =
  useGetMfaAdminDetailsQuery({ params: { userId: mfaUserId } }, { skip: !data })

  useEffect(() => {
    if (data) {
      setMfaStatus(data.enabled)
      setRecoveryCode(data.recoveryCodes ? data.recoveryCodes : [])
      setUserId(data.userId)
    }
    if (details) {
      setContactId(details?.contactId ? details?.contactId : smsSublabel )
      const sms = details?.mfaMethods.includes('SMS') || details?.mfaMethods.includes('EMAIL')
      const mobile = details?.mfaMethods.includes('MOBILEAPP')
      setSmsToggle(sms)
      setAuthAppToggle(mobile)
    }
  }, [data, details])

  const onChangeSms = (checked: boolean) => {
    setSmsToggle(checked)
  }

  const onChangeAuthApp = (checked: boolean) => {
    setAuthAppToggle(checked)
  }

  const AuthenticationMethod = () => {
    return (
      <Row gutter={20}>
        <Col span={8}>
          <Subtitle level={5} >
            { $t({ defaultMessage: 'Set authentication method' }) }</Subtitle>
          <UI.FieldLabel2 width='275px'>
            <OtpLabel>
              {$t({ defaultMessage: 'One Time Password (OTP)' })}
              {contactId}
            </OtpLabel>
            <Form.Item
              name='otp_toggle'
              children={<Switch checked={mfaSmsToggle} onChange={onChangeSms}></Switch>}
            />
            <Form.Item
              name='set_otp'
              children={<UI.FieldTextLink onClick={()=>setOtpVisible(true)}>
                {mfaSmsToggle
                  ? $t({ defaultMessage: 'Change' }) : $t({ defaultMessage: 'Set' })}
              </UI.FieldTextLink>
              }
            />
          </UI.FieldLabel2>

          <UI.FieldLabel2 width='275px'>
            <OtpLabel>
              {$t({ defaultMessage: 'Authentication App' })}
              {authAppSublabel}
            </OtpLabel>
            <Form.Item
              name='auth_toggle'
              children={<Switch checked={mfaAuthAppToggle} onChange={onChangeAuthApp}></Switch>}
            />
            <Form.Item
              name='set_auth'
              children={<UI.FieldTextLink onClick={()=>setAuthAppVisible(true)}>
                {mfaAuthAppToggle
                  ? $t({ defaultMessage: 'Add App' }) : $t({ defaultMessage: 'Set' })}
              </UI.FieldTextLink>
              }
            />
          </UI.FieldLabel2>

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
          <UI.FieldLabel width='275px'>
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
          </UI.FieldLabel>
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
                  <label>{mfaStatus ? 'On' : 'Off'}</label>
                }
              />
            </Col>
          </Row>
          {mfaStatus && <AuthenticationMethod />}
          {mfaStatus && <BackupAuthenticationMethod />}
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
        userId={mfaUserId}
      />}
      {otpVisible &&<OneTimePassword
        visible={otpVisible}
        setVisible={setOtpVisible}
      />}
    </>

  )
}

import { useState } from 'react'

import { MailFilled, PhoneFilled } from '@ant-design/icons'
import {
  Row,
  Col,
  Form,
  Switch,
  Tooltip,
  FormInstance
} from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle }                               from '@acx-ui/components'
import { MFAMethod, useDisableMFAMethodMutation } from '@acx-ui/user'

import * as UI from '../styledComponents'

import { AuthApp }         from './AuthApp'
import { OneTimePassword } from './OneTimePassword'

export const AuthenticationMethod = (props: { formRef: FormInstance }) => {
  const { formRef } = props
  const { $t } = useIntl()
  const [otpVisible, setOtpVisible] = useState(false)
  const [authAppVisible, setAuthAppVisible] = useState(false)
  const [disableMFAMethod] = useDisableMFAMethodMutation()

  const onChangeSms = async (checked: boolean) => {
    if (checked) {
      setOtpVisible(true)
      return
    }

    const { mfaMethods } = formRef.getFieldsValue(true)

    try {
      const mfaMethod = mfaMethods.includes(MFAMethod.SMS)
        ? MFAMethod.SMS : MFAMethod.EMAIL
      await disableMFAMethod({ params: { mfaMethod } }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onChangeAuthApp = async (checked: boolean) => {
    if (checked) {
      setAuthAppVisible(true)
      return
    }

    try {
      await disableMFAMethod({
        params: {
          mfaMethod: MFAMethod.MOBILEAPP
        }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const warningTooltip = (show: boolean) => {
    return show ? $t({ defaultMessage: 'You must set at least one authentication methed.' }) : ''
  }

  return (
    <>
      <Row>
        <Col span={24}>
          <Subtitle level={5} >
            { $t({ defaultMessage: 'Set authentication method' }) }
          </Subtitle>
        </Col>
        <Col span={24}>
          <UI.FieldLabel2 width='275px'>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => {
                return prevValues.contactId !== currentValues.contactId ||
                prevValues.mfaMethods !== currentValues.mfaMethods
              }}
            >
              {({ getFieldValue }) => {
                const contactId = getFieldValue('contactId')
                const PrefixIcon = (getFieldValue('mfaMethods') as string[])
                  ?.includes(MFAMethod.EMAIL) ? MailFilled : PhoneFilled

                return <UI.OtpLabel>
                  {$t({ defaultMessage: 'One Time Password (OTP)' })}
                  {
                    contactId ?
                      (<UI.PrefixIconWrapper><PrefixIcon />{contactId}</UI.PrefixIconWrapper>)
                      : $t({ defaultMessage: 'We will send you a code via SMS or Email' })
                  }
                </UI.OtpLabel>
              }}
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => {
                return prevValues.mfaMethods !== currentValues.mfaMethods
              }}
            >
              {({ getFieldValue }) => {
                const disable = getFieldValue('otpToggle')
                             && !getFieldValue('authAppToggle')

                return <Form.Item
                  name='otpToggle'
                  valuePropName='checked'
                >
                  <Tooltip title={warningTooltip(disable)}>
                    <Switch
                      aria-label='otp'
                      disabled={disable}
                      checked={getFieldValue('otpToggle')}
                      onChange={onChangeSms}/>
                  </Tooltip>
                </Form.Item>
              }}
            </Form.Item>

            <Form.Item
              dependencies={['mfaMethods']}
            >
              {({ getFieldValue }) => {
                const enabledMethods = getFieldValue('mfaMethods')
                const smsConfigured = enabledMethods?.includes(MFAMethod.SMS) ||
                               enabledMethods?.includes(MFAMethod.EMAIL)

                return (<UI.FieldTextLink
                  onClick={()=>setOtpVisible(true)}
                >
                  {smsConfigured
                    ? $t({ defaultMessage: 'Change' }) : $t({ defaultMessage: 'Set' })}
                </UI.FieldTextLink>)
              }}
            </Form.Item>
          </UI.FieldLabel2>
        </Col>
        <Col span={24}>
          <UI.FieldLabel2 width='275px'>
            <UI.OtpLabel>
              {$t({ defaultMessage: 'Authentication App' })}
              {$t({ defaultMessage: 'You’ll receive a login code via an authentication app' })}
            </UI.OtpLabel>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => {
                return prevValues.mfaMethods !== currentValues.mfaMethods
              }}
            >
              {({ getFieldValue }) => {
                const disable = getFieldValue('authAppToggle')
                             && !getFieldValue('otpToggle')

                return <Form.Item
                  name='authAppToggle'
                  valuePropName='checked'
                >
                  <Tooltip title={warningTooltip(disable)}>
                    <Switch
                      aria-label='app'
                      disabled={disable}
                      checked={getFieldValue('authAppToggle')}
                      onChange={onChangeAuthApp}/>
                  </Tooltip>
                </Form.Item>
              }}
            </Form.Item>
            <Form.Item
              dependencies={['mfaMethods']}
            >
              {({ getFieldValue }) => {
                const enabledMethods = getFieldValue('mfaMethods')
                const authAppConfigured = enabledMethods?.includes(MFAMethod.MOBILEAPP)

                return (<UI.FieldTextLink
                  onClick={()=>setAuthAppVisible(true)}
                >
                  {authAppConfigured
                    ? $t({ defaultMessage: 'Add App' }) : $t({ defaultMessage: 'Set' })}
                </UI.FieldTextLink>)
              }}
            </Form.Item>
          </UI.FieldLabel2>
        </Col>
      </Row>
      <Form.Item
        noStyle
        dependencies={['userId']}
      >
        {({ getFieldValue }) => {
          const userId = getFieldValue('userId')
          return <>
            {(authAppVisible && userId) ? <AuthApp
              visible={authAppVisible}
              setVisible={setAuthAppVisible}
              userId={userId}
            /> : ''}

            {(otpVisible && userId) ? <OneTimePassword
              visible={otpVisible}
              setVisible={setOtpVisible}
              userId={userId}
            />:''}
          </>
        }}
      </Form.Item>
    </>
  )
}

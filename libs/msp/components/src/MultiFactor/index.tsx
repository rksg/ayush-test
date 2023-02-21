import { useEffect, useState } from 'react'

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

import { showToast } from '@acx-ui/components'
import {
  Subtitle
} from '@acx-ui/components'
import {
  useGetMfaAdminDetailsQuery,
  useGetMfaTenantDetailsQuery,
  useDisableMFAMethodMutation
} from '@acx-ui/rc/services'
import { MFAMethod } from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'

import { AuthApp }         from './AuthApp'
import { OneTimePassword } from './OneTimePassword'
import { RecoveryCodes }   from './RecoveryCodes'
import * as UI             from './styledComponents'


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
      setOtpVisible(checked)
    } catch {
      // TODO: handle disable failed error?
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
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

      setAuthAppVisible(checked)
    } catch {
      // TODO: handle disable failed error?
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const warningTooltip = (show: boolean) => {
    return show ? $t({ defaultMessage: 'You must set at least one authentication methed.' }) : ''
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={8}>
          <Subtitle level={5} >
            { $t({ defaultMessage: 'Set authentication method' }) }
          </Subtitle>
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
                const PrefixIcon = getFieldValue('smsToggle') ? MailFilled : PhoneFilled

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
              dependencies={['mfaMethods']}
            >
              {({ getFieldValue }) => {
                const disable = getFieldValue('smsToggle')
                             && !getFieldValue('authAppToggle')

                return <Tooltip title={warningTooltip(disable)}>
                  <Switch
                    disabled={disable}
                    checked={getFieldValue('smsToggle')}
                    onChange={onChangeSms}/>
                </Tooltip>
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

          <UI.FieldLabel2 width='275px'>
            <UI.OtpLabel>
              {$t({ defaultMessage: 'Authentication App' })}
              {$t({ defaultMessage: 'You’ll receive a login code via an authentication app' })}
            </UI.OtpLabel>
            <Form.Item
              dependencies={['mfaMethods']}
            >
              {({ getFieldValue }) => {
                const disable = getFieldValue('authAppToggle')
                             && !getFieldValue('smsToggle')

                return <Tooltip title={warningTooltip(disable)}>
                  <Switch
                    disabled={disable}
                    checked={getFieldValue('authAppToggle')}
                    onChange={onChangeAuthApp}/>
                </Tooltip>
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

export const BackupAuthenticationMethod = (props: { recoveryCodes: string[] }) => {
  const { recoveryCodes } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Row gutter={20}>
        <Col span={8}>
          <Subtitle level={5} style={{ marginTop: '16px' }}>
            { $t({ defaultMessage: 'Backup authentication method' }) }</Subtitle>
          <UI.FieldLabel width='275px'>
            <UI.OtpLabel>
              {$t({ defaultMessage: 'Recovery Codes' })}
              {'User recovery codes to log in if you can’t receive a verification code via ' +
             'email, SMS, or an auth app'}
            </UI.OtpLabel>
            <Form.Item
              children={<UI.FieldTextLink onClick={()=>setVisible(true)}>
                {$t({ defaultMessage: 'See' })}
              </UI.FieldTextLink>
              }
            />
          </UI.FieldLabel>
        </Col>
      </Row>
      {visible && <RecoveryCodes
        visible={visible}
        setVisible={setVisible}
        recoveryCode={recoveryCodes}
      />}
    </>
  )
}

export const MultiFactor = () => {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()
  const { data } = useGetMfaTenantDetailsQuery({ params: { tenantId } })
  const { data: details } =
  useGetMfaAdminDetailsQuery({ params: { userId: data?.userId } }, { skip: !data })

  useEffect(() => {
    const smsEnabled = details?.mfaMethods.includes(MFAMethod.SMS) ||
                    details?.mfaMethods.includes(MFAMethod.EMAIL)
    const mobileEnabled = details?.mfaMethods.includes(MFAMethod.MOBILEAPP)

    form.setFieldsValue({
      ...data,
      ...details,
      smsToggle: smsEnabled,
      authAppToggle: mobileEnabled
    })
  }, [form, data, details])

  const mfaStatus = data?.enabled

  return (
    <Form
      form={form}
      layout='vertical'
    >
      <Row gutter={20}>
        <Col span={8}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Multi-Factor Authentication' }) }
          </Subtitle>
          <Form.Item style={{ marginTop: '14px' }}
            label={$t({ defaultMessage: 'Multi-Factor Authentication' })}
            tooltip={$t({ defaultMessage:
                  'This option is controlled by the Prime-Administrator(s) of this account.' +
                  'If they turn it on, you will be able to manage here your authentication ' +
                  'settings' })}
          >
            <label>
              {mfaStatus ? $t({ defaultMessage: 'On' }) : $t({ defaultMessage: 'Off' })}
            </label>
          </Form.Item>
        </Col>
      </Row>
      {mfaStatus && <AuthenticationMethod formRef={form} />}
      {mfaStatus && <BackupAuthenticationMethod
        recoveryCodes={data.recoveryCodes ? data.recoveryCodes : []}
      />}
    </Form>
  )
}

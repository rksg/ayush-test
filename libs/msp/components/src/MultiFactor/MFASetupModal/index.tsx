import { useEffect } from 'react'

import { Row, Col, Form, Typography, Space } from 'antd'
import { useIntl }                           from 'react-intl'
import { useParams }                         from 'react-router-dom'

import { cssStr, Modal }       from '@acx-ui/components'
import {
  MFAMethod,
  useGetMfaTenantDetailsQuery,
  useGetMfaAdminDetailsQuery
} from '@acx-ui/user'

import { AuthenticationMethod }       from '../AuthenticationMethod'
import { BackupAuthenticationMethod } from '../BackupAuthenticationMethod'

interface MFASetupModalProps {
  onFinish: () => void
}

export const MFASetupModal = (props: MFASetupModalProps) => {
  const { onFinish } = props
  const params = useParams()
  const { $t } = useIntl()
  const { data } = useGetMfaTenantDetailsQuery({ params })
  const mfaEnabled= data?.enabled
  const { data: details } = useGetMfaAdminDetailsQuery({
    params: { userId: data?.userId } },
  { skip: !mfaEnabled })

  const [form] = Form.useForm()
  const otpToggle = Form.useWatch('otpToggle', form)
  const authAppToggle = Form.useWatch('authAppToggle', form)

  const handleCancel = () => {
    // redirect to login page
    const token = sessionStorage.getItem('jwt')?? null
    sessionStorage.removeItem('jwt')
    window.location.href = token? `/logout?token=${token}` : '/logout'
  }

  useEffect(() => {
    if (details) {
      const otpEnabled = details?.mfaMethods.includes(MFAMethod.SMS) ||
                    details?.mfaMethods.includes(MFAMethod.EMAIL)
      const mobileEnabled = details?.mfaMethods.includes(MFAMethod.MOBILEAPP)

      form.setFieldsValue({
        contactId: '',
        ...data,
        ...details,
        otpToggle: otpEnabled,
        authAppToggle: mobileEnabled
      })
    }
  }, [form, data, details])

  const disableBtn = mfaEnabled && !otpToggle && !authAppToggle

  return <Modal
    title={$t({ defaultMessage: 'Multi-Factors Authentication Setup' })}
    width={510}
    visible={true}
    okText={$t({ defaultMessage: 'Log in' })}
    onCancel={handleCancel}
    onOk={onFinish}
    okButtonProps={{
      disabled: disableBtn
    }}
    maskClosable={false}
    keyboard={false}
  >
    <Form
      form={form}
      layout='vertical'
    >
      <Row gutter={20}>
        <Col span={21}>
          <Form.Item
            label={
              <Space direction='vertical' >
                <Typography.Text style={{
                  fontSize: cssStr('--acx-headline-4-font-size')
                }}>                {
                  // eslint-disable-next-line max-len
                    $t({ defaultMessage: 'Multi-Factor Authentication was activated for this account' })
                  }
                </Typography.Text>
                <Typography.Text style={{
                  fontSize: cssStr('--acx-body-4-font-size'),
                  color: cssStr('--acx-neutrals-60')
                }}>
                  {
                  // eslint-disable-next-line max-len
                    $t({ defaultMessage: 'You need to set your authentication method, in order to be able to login successfully.' })
                  }
                </Typography.Text>
              </Space>
            }
            tooltip={$t({ defaultMessage:
                  'This option is controlled by the Prime-Administrator(s) of this account.' +
                  'If they turn it on, you will be able to manage here your authentication ' +
                  'settings' })}
          />
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={24}>
          <AuthenticationMethod formRef={form} />
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={24}>
          <Form.Item
            noStyle
            dependencies={['recoveryCodes']}>
            {({ getFieldValue }) => {
              const recoveryCodes = getFieldValue('recoveryCodes')
              return <BackupAuthenticationMethod
                recoveryCodes={recoveryCodes ?? []}
              />
            }}
          </Form.Item>
        </Col>
      </Row>
    </Form>
  </Modal>
}

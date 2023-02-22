import { useEffect } from 'react'

import { Modal, Row, Col, Form, Typography, Space } from 'antd'
import { useIntl }                                  from 'react-intl'
import { useParams }                                from 'react-router-dom'

import { cssStr }                                                  from '@acx-ui/components'
import { useGetMfaTenantDetailsQuery, useGetMfaAdminDetailsQuery } from '@acx-ui/rc/services'
import { MFAMethod }                                               from '@acx-ui/rc/utils'
// import { MfaDetailStatus, MFAMethod } from '@acx-ui/rc/utils'
// import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { AuthenticationMethod, BackupAuthenticationMethod } from '../'

interface MFASetupModalProps {
  // mfaDetails: MfaDetailStatus | undefined,
  onFinish: () => void
}

export const MFASetupModal = (props: MFASetupModalProps) => {
  // const { mfaDetails, onFinish } = props
  const { onFinish } = props
  const params = useParams()
  const { $t } = useIntl()
  const { data } = useGetMfaTenantDetailsQuery({ params })
  const { data: details } =
  useGetMfaAdminDetailsQuery({ params: { userId: data?.userId } }, { skip: !data })

  const [form] = Form.useForm()
  const mfaMethods = Form.useWatch('mfaMethods', form)

  const handleCancel = () => {
    // redirect to login page
    window.location.href = '/logout'
  }

  // useEffect(() => {
  //   if (mfaDetails) {
  //     const smsEnabled = mfaDetails?.mfaMethods.includes(MFAMethod.SMS) ||
  //     mfaDetails?.mfaMethods.includes(MFAMethod.EMAIL)
  //     const mobileEnabled = mfaDetails?.mfaMethods.includes(MFAMethod.MOBILEAPP)

  //     form.setFieldsValue({
  //       ...mfaDetails,
  //       smsToggle: smsEnabled,
  //       authAppToggle: mobileEnabled
  //     })
  //   }
  // }, [form, mfaDetails])

  useEffect(() => {
    if (details) {
      const smsEnabled = details?.mfaMethods.includes(MFAMethod.SMS) ||
                    details?.mfaMethods.includes(MFAMethod.EMAIL)
      const mobileEnabled = details?.mfaMethods.includes(MFAMethod.MOBILEAPP)

      form.setFieldsValue({
        ...data,
        ...details,
        smsToggle: smsEnabled,
        authAppToggle: mobileEnabled
      })
    }
  }, [form, data, details])

  const disableBtn = mfaMethods ? mfaMethods.length === 0 : true

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
            name='info'
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
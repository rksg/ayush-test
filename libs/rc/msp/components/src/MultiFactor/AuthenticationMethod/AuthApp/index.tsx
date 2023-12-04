import { Form, Input, Tooltip, Typography, Row } from 'antd'
import { useIntl }                               from 'react-intl'
import styled                                    from 'styled-components/macro'

import { Drawer }              from '@acx-ui/components'
import {
  MFAMethod,
  useMfaRegisterPhoneQuery,
  useSetupMFAAccountMutation
} from '@acx-ui/user'

import * as UI from './styledComponents'

interface AuthAppProps {
  className?: string;
  visible: boolean
  setVisible: (visible: boolean) => void
  userId: string
}

export const AuthApp = styled((props: AuthAppProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, userId } = props
  const [form] = Form.useForm()
  const { data } = useMfaRegisterPhoneQuery({ params: { userId: userId } })
  const [setupMFAAccount] = useSetupMFAAccountMutation()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const handleSave = () => {
    const verificationCode = form.getFieldValue('verificationCode')

    const payload = {
      method: MFAMethod.MOBILEAPP,
      otp: verificationCode
    }

    setupMFAAccount({ params: { userId }, payload })
    setVisible(false)
  }

  const footer = <Drawer.FormFooter
    buttonLabel={{ save: $t({ defaultMessage: 'Confirm' }) }}
    onCancel={onClose}
    onSave={async () => form.submit()}
  />

  return (
    <Drawer
      className={props.className}
      title={$t({ defaultMessage: 'Manage Authentication App' })}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose
      width={336}
    >
      <Form layout='vertical' form={form} onFinish={handleSave}>
        <Typography>
          <Typography.Paragraph>
            <Typography.Text>
              {
                $t({ defaultMessage: 'To enable MFA using an authentication app'+
                                ', follow these steps:' })
              }
            </Typography.Text>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <ol>
              <Tooltip
                title={
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Head to the App store on iOS devices and the Play Store on Android devices.' +
                    // eslint-disable-next-line max-len
                    ' Search for "Authentication application" and choose one of the suggested apps' })
                }>
                <li>
                  <Typography.Text className='hasTooltip'>
                    {
                      $t({ defaultMessage: 'Install an authentication app on your mobile device' })
                    }
                  </Typography.Text>
                </li>
              </Tooltip>
              <li>
                <Typography.Text>
                  { $t({ defaultMessage: 'Open the app, then select "Add Account"' }) }
                </Typography.Text>
              </li>
              <li>
                <Typography.Text>
                  { $t({ defaultMessage: 'Scan the QR code below:' }) }
                </Typography.Text>

                <UI.QRCodeImgWrapper direction='vertical' size='large'>
                  <img
                    src={data?.url ?? ''}
                    alt={data?.url ?? ''}
                  />
                  <Row>
                    <Typography.Text>
                      { $t({ defaultMessage: 'Or enter this key into the app:' }) }
                    </Typography.Text>
                    <Typography.Text strong>
                      { data?.key ?? '' }
                    </Typography.Text>
                  </Row>
                </UI.QRCodeImgWrapper>
              </li>
              <li>
                <Typography.Text>
                  {
                    $t({ defaultMessage: 'Enter the verification code generated '+
                                  'by your authentication app:' })
                  }
                </Typography.Text>
                <Form.Item
                  name='verificationCode'
                  rules={[
                    {
                      required: true,
                      message: $t({ defaultMessage: 'Please enter verification code' })
                    }
                  ]}
                >
                  <Input
                    placeholder={$t({ defaultMessage: 'Enter the validation code' })}/>
                </Form.Item>
              </li>
            </ol>
          </Typography.Paragraph>
        </Typography>
      </Form>
    </Drawer>
  )
})`${UI.AuthAppDrawerStyle}`

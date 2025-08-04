import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { PasswordInput, Select }                                     from '@acx-ui/components'
import { getIpsecAuthTypeOptions, IpSecAuthEnum, ipSecPskValidator } from '@acx-ui/rc/utils'

export const AuthenticationFormItem = () => {
  const { $t } = useIntl()
  const authOptions = getIpsecAuthTypeOptions()

  return <><Form.Item
    name='authType'
    label={$t({ defaultMessage: 'Authentication' })}
    rules={[{ required: true }]}
  >
    <Select options={authOptions} />
  </Form.Item>
  <Form.Item
    noStyle
    dependencies={['authType']}
  >
    {({ getFieldValue }) => {
      const authType = getFieldValue('authType')
      return authType === IpSecAuthEnum.PSK &&
            <PreSharedKeyFormItem />
    }}
  </Form.Item>

  <Form.Item
    noStyle
    dependencies={['authType']}
  >
    {({ getFieldValue }) => {
      const authType = getFieldValue('authType')
      return authType === IpSecAuthEnum.CERTIFICATE &&
            <CertificateFormItem />
    }}

  </Form.Item>
  </>
}

export const PreSharedKeyFormItem = () => {
  const { $t } = useIntl()
  return <Form.Item
    data-testid='pre-shared-key'
    name='preSharedKey'
    label={$t({ defaultMessage: 'Pre-shared Key' })}
    validateFirst
    rules={[{ required: true },
      { validator: (_, value) => ipSecPskValidator(value) }]}
    children={
      <PasswordInput />
    } />
}

// TODO: hide until certificates are supported
const CertificateFormItem = () => {
  const { $t } = useIntl()
  return <Form.Item
    name='certificate'
    label={$t({ defaultMessage: 'Certificate' })}
    rules={[{ required: true }]}
    children={<Input />}
  />
}
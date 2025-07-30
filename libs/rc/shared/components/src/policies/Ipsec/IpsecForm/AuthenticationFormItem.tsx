import { Form, Input } from 'antd'

import { PasswordInput, Select }            from '@acx-ui/components'
import { IpSecAuthEnum, ipSecPskValidator } from '@acx-ui/rc/utils'

import { $t } from '../../WorkflowCanvas/WorkflowPanel/__tests__/fixtures'

export const AuthenticationFormItem = () => {
  const authOptions = [
    { label: $t({ defaultMessage: 'Pre-shared Key' }), value: IpSecAuthEnum.PSK }
    // hide until certificates are supported
    // { label: $t({ defaultMessage: 'Certificate' }), value: IpSecAuthEnum.CERTIFICATE }
  ]

  return <><Form.Item
    name='authType'
    label={$t({ defaultMessage: 'Authentication' })}
    rules={[{ required: true }]}
    children={<Select
      // style={{ width: '380px' }}
      children={
        authOptions.map((option) =>
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>)
      }
    />}
  />
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
  return <Form.Item
    data-testid='pre-shared-key'
    name='preSharedKey'
    label={$t({ defaultMessage: 'Pre-shared Key' })}
    rules={[{ required: true },
      { validator: (_, value) => ipSecPskValidator(value) }]}
    children={
      <PasswordInput />
    } />
}

// TODO: hide until certificates are supported
const CertificateFormItem = () => {
  return <Form.Item
    name='certificate'
    label={$t({ defaultMessage: 'Certificate' })}
    rules={[{ required: true }]}
    children={<Input />}
  />
}
import { Form, Select } from 'antd'

import { PasswordInput } from '@acx-ui/components'
import { IpSecAuthEnum } from '@acx-ui/rc/utils'

import { $t } from '../../WorkflowCanvas/WorkflowPanel/__tests__/fixtures'

export const AuthenticationFormItem = () => {
  return <><Form.Item
    name='authType'
    label={$t({ defaultMessage: 'Authentication' })}
    rules={[{ required: true }]}
    initialValue={authType}
    children={
      readMode ?
        (ipsecData?.authenticationType=== IpSecAuthEnum.PSK ?
          <div>{$t({ defaultMessage: 'Pre-shared Key' })}</div> :
          <div>{$t({ defaultMessage: 'Certificate' })}</div>) :
        <Select
          style={{ width: '380px' }}
          placeholder={$t({ defaultMessage: 'Select...' })}
          children={
            authOptions.map((option) =>
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>)
          }
          onChange={onAuthTypeChange}
        />
    }
  />
  <Form.Item
    dependencies={['authType']}
  >
    {({ getFieldValue }) => {
      const authType = getFieldValue('authType')
      return authType === IpSecAuthEnum.PSK && !readMode &&
            <PreSharedKeyFormItem />
    }}
  </Form.Item>

  <Form.Item
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
  return <Form.Item label={$t({ defaultMessage: 'Pre-shared Key' })}
    children={
      <PasswordInput readOnly
        value={ipsecData?.preSharedKey}
        style={{ width: '100%', border: 'none' }} />
    } />

}

const CertificateFormItem = () => {
  return <Form.Item name='certificate'
    label={$t({ defaultMessage: 'Certificate' })}
    rules={[{ required: true }]}
    children={<Input />} />
}
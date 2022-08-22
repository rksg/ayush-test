import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  ipV4RegExp,
  portRegExp,
  stringContainSpace
} from '@acx-ui/rc/utils'

export function IpPortSecretForm ({ serverType, order }: 
  { serverType: AaaServerTypeEnum, order: AaaServerOrderEnum }) {
  const { $t } = useIntl()
  return (
    <>
      <Form.Item
        name={`${serverType}.${order}.ip`}
        label={$t({ defaultMessage: 'IP Address' })}
        rules={[{
          required: true,
          whitespace: false
        },{
          validator: (_, value) => ipV4RegExp(value)
        }]}
        children={<Input />}
        style={{ display: 'inline-block', width: 'calc(80%)' , paddingRight: '20px' }}
      />
      <Form.Item
        name={`${serverType}.${order}.port`}
        label={$t({ defaultMessage: 'Port' })}
        rules={[{
          required: true
        },{
          validator: (_, value) => portRegExp(value)
        }]}
        children={<Input type='number'/>}
        style={{ display: 'inline-block', width: 'calc(20%)' }}
        initialValue={serverType === 'authRadius' ? 1812 : 1813}
      />
      <Form.Item
        name={`${serverType}.${order}.sharedSecret`}
        label={$t({ defaultMessage: 'Shared secret' })}
        rules={[{
          required: true,
          whitespace: false
        },{
          validator: (_, value) => stringContainSpace(value)
        }]}
        children={<Input.Password />}
      />
    </>
  )
}
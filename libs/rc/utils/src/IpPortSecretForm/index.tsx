import { Form, Input } from 'antd'
import { Subtitle }    from '@acx-ui/components'
import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  networkWifiIpRegExp,
  networkWifiPortRegExp,
  stringContainSpace
} from '@acx-ui/rc/utils'

export function IpPortSecretForm ({title, serverType, order}: {title: string, serverType: AaaServerTypeEnum, order: AaaServerOrderEnum}) {
  return (
    <>
      <Subtitle level={4} children={title} />
      <Form.Item
        name={`${serverType}.${order}.ip`}
        label='IP Address'
        rules={[{
          required: true,
          whitespace: false
        },{
          validator: (_, value) => networkWifiIpRegExp(value)
        }]}
        children={<Input />}
        style={{ display: 'inline-block', width: 'calc(80%)' , paddingRight: '20px' }}
      />
      <Form.Item
        name={`${serverType}.${order}.port`}
        label='Port'
        rules={[{
          required: true
        },{
          validator: (_, value) => networkWifiPortRegExp(value)
        }]}
        children={<Input type='number'/>}
        style={{ display: 'inline-block', width: 'calc(20%)' }}
      />
      <Form.Item
        name={`${serverType}.${order}.secretName`}
        label='Shared secret'
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
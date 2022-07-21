import { Form, Input } from 'antd'

import { AaaServerTypeEnum, AaaServerOrderEnum }      from './constants'
import { ipV4RegExp, portRegExp, stringContainSpace } from './validator' 

export function IpPortSecretForm ({ serverType, order }: 
  { serverType: AaaServerTypeEnum, order: AaaServerOrderEnum }) {
  return (
    <>
      <Form.Item
        name={`${serverType}.${order}.ip`}
        label='IP Address'
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
        label='Port'
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
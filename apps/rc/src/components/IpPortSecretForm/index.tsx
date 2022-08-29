import { useContext } from 'react'

import { Form, Input, InputNumber } from 'antd'
import { useIntl }                  from 'react-intl'

import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  networkWifiIpRegExp,
  networkWifiSecretRegExp
} from '@acx-ui/rc/utils'

import NetworkFormContext from '../../pages/NetworkForm/NetworkFormContext'

export function IpPortSecretForm ({ serverType, order }:
  { serverType: AaaServerTypeEnum, order: AaaServerOrderEnum }) {
  const { data } = useContext(NetworkFormContext)
  const intl = useIntl()
  const form = Form.useFormInstance()
  if(data){
    form.setFieldsValue({
      authRadius: {
        primary: {
          ip: data.authRadius?.primary?.ip,
          port: data.authRadius?.primary?.port,
          sharedSecret: data.authRadius?.primary?.sharedSecret
        },
        secondary: {
          ip: data.authRadius?.secondary?.ip,
          port: data.authRadius?.secondary?.port,
          sharedSecret: data.authRadius?.secondary?.sharedSecret
        }
      },
      accountingRadius: {
        primary: {
          ip: data.accountingRadius?.primary?.ip,
          port: data.accountingRadius?.primary?.port,
          sharedSecret: data.accountingRadius?.primary?.sharedSecret
        },
        secondary: {
          ip: data.accountingRadius?.secondary?.ip,
          port: data.accountingRadius?.secondary?.port,
          sharedSecret: data.accountingRadius?.secondary?.sharedSecret
        }
      }
    })
  }
  return (
    <>
      <Form.Item
        validateFirst
        name={[serverType, order, 'ip']}
        label={intl.$t({ defaultMessage: 'IP Address' })}
        rules={[
          { required: true },
          { validator: (_, value) => networkWifiIpRegExp(intl, value) }
        ]}
        children={<Input />}
        style={{ display: 'inline-block', width: 'calc(80%)' , paddingRight: '20px' }}
      />
      <Form.Item
        name={[serverType, order, 'port']}
        label={intl.$t({ defaultMessage: 'Port' })}
        rules={[
          { required: true },
          { type: 'number', min: 1 },
          { type: 'number', max: 65535 }
        ]}
        style={{ display: 'inline-block', width: 'calc(20%)' }}
        initialValue={serverType === 'authRadius' ? 1812 : 1813}
        children={<InputNumber min={1} max={65535} />}
      />
      <Form.Item
        name={[serverType, order, 'sharedSecret']}
        label={intl.$t({ defaultMessage: 'Shared secret' })}
        rules={[
          { required: true },
          { validator: (_, value) => networkWifiSecretRegExp(intl, value) }
        ]}
        children={<Input.Password />}
      />
    </>
  )
}

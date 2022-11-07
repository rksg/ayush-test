import { Form, Input, InputNumber } from 'antd'
import { isEqual }                  from 'lodash'
import { FormInstance }             from 'rc-field-form/lib/interface'
import { useIntl, IntlShape }       from 'react-intl'

import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  networkWifiIpRegExp,
  networkWifiSecretRegExp,
  NetworkSaveData
} from '@acx-ui/rc/utils'

export function IpPortSecretForm ({ serverType, order }:
  { serverType: AaaServerTypeEnum, order: AaaServerOrderEnum }) {
  const intl = useIntl()
  return (
    <>
      <Form.Item
        validateFirst
        name={[serverType, order, 'ip']}
        label={intl.$t({ defaultMessage: 'IP Address' })}
        rules={[
          { required: true },
          { validator: (_, value) => networkWifiIpRegExp(value) },
          ( formInstance ) => ({
            validator: () => checkIpAndPortUnique(serverType, order, 'ip', formInstance, intl)
          })
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
          { type: 'number', max: 65535 },
          ( formInstance ) => ({
            validator: () => checkIpAndPortUnique(serverType, order, 'port', formInstance, intl)
          })
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
          { validator: (_, value) => networkWifiSecretRegExp(value) }
        ]}
        children={<Input.Password />}
      />
    </>
  )
}

function checkIpAndPortUnique (
  serverType: AaaServerTypeEnum,
  order: AaaServerOrderEnum,
  field: 'ip' | 'port',
  { getFieldValue, getFieldsError, validateFields, setFields }: FormInstance<NetworkSaveData>,
  intl: IntlShape
) {
  const currentFieldSet = [serverType, order]
  const { ip, port } = getFieldValue(currentFieldSet)
  const relatedFields = getFieldsError().map(item => item.name)
    .filter(name => (name.includes('authRadius') || name.includes('accountingRadius'))
                && !name.includes('sharedSecret'))

  const ipList = relatedFields
    .filter(filed => filed.includes('ip') && !currentFieldSet.every(f=> filed.includes(f)))
    .map(filed => {
      const { ip, port } = getFieldValue(filed.slice(0, 2))
      return ip && port ? `${ip}_${port}` : null
    }).filter(item => item)

  const revalidateErrorFields = () => {
    const fields = getFieldsError(relatedFields)
      .filter(item => item.errors.length)
      .map(item => item.name)
    if (fields.length) {
      validateFields(fields)
    }
  }

  const hasDuplicate = ipList.filter(item => isEqual(item, `${ip}_${port}`)).length > 0
  if (hasDuplicate) {
    // trigger display error for Ip/port
    const isIpField = field === 'ip'
    const errorMsg = intl.$t({ defaultMessage: 'IP address and Port combinations must be unique' })
    const relatedField = isIpField ? 'port' : 'ip'
    const relatedFieldMsg = isIpField ? '' : errorMsg
    setFields([{
      name: [serverType, order, relatedField],
      errors: [relatedFieldMsg]
    }])

    return isIpField
      ? Promise.reject(new Error(errorMsg))
      : Promise.reject(new Error(''))
  }

  revalidateErrorFields()
  return Promise.resolve()
}
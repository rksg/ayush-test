import { useEffect } from 'react'

import { Form, Select }                             from 'antd'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import {
  StepsFormNew,
  Tooltip,
  useStepFormContext
} from '@acx-ui/components'

import {
  authMethodsByClientType,
  authMethodsByCode
} from '../../authMethods'
import * as contents     from '../../contents'
import {
  AuthenticationMethod as AuthenticationMethodEnum,
  NetworkHealthFormDto
} from '../../types'

const name = 'authenticationMethod' as const
const label = defineMessage({ defaultMessage: 'Authentication Method' })

export function AuthenticationMethod () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const [code, clientType] = [
    Form.useWatch(name, form),
    Form.useWatch('clientType', form)
  ]
  const methods = authMethodsByClientType[clientType]

  // TODO:
  // Add suggested method based on selected WLAN
  const options = methods?.map(method => <Select.Option
    key={method.code}
    value={method.code}
    children={$t(method.title)}
  />)

  useEffect(() => {
    if (!code) return
    if (methods?.some(method => method.code === code)) return
    form.setFieldValue(name, undefined)
  }, [form, methods, code, clientType])

  const mainLabel = <>
    {$t(label)}
    <Tooltip.Question
      title={<FormattedMessage
        {...contents.unsupportedAuthMethods[clientType]}
        values={contents.formatValues}
      />}
    />
  </>

  return <Form.Item required label={mainLabel}>
    <Form.Item
      noStyle
      name={name}
      label={$t(label)}
      rules={[{ required: true }]}
      children={<Select
        placeholder={$t({ defaultMessage: 'Select an authentication method' })}
        children={options}
      />}
    />
  </Form.Item>
}

AuthenticationMethod.fieldName = name
AuthenticationMethod.label = label

AuthenticationMethod.FieldSummary = function AuthenticationMethodFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary<AuthenticationMethodEnum>
      convert={(code) => $t(authMethodsByCode[code!].title)}
    />}
  />
}

import { useEffect } from 'react'

import { Form, Select }              from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Tooltip,
  useStepFormContext,
  useWatch
} from '@acx-ui/components'

import { authMethodsByClientType } from '../../authMethods'
import * as contents               from '../../contents'
import { NetworkHealthFormDto }    from '../../types'

export function AuthenticationMethod () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const [code, clientType] = [
    useWatch('authenticationMethod', form),
    useWatch('clientType', form)
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
    form.setFieldValue('authenticationMethod', undefined)
  }, [form, methods, code, clientType])

  const label = <>
    {$t({ defaultMessage: 'Authentication Method' })}
    <Tooltip.Info
      title={<FormattedMessage
        {...contents.unsupportedAuthMethods[clientType]}
        values={contents.formatValues}
      />}
    />
  </>

  return <Form.Item required label={label}>
    <Form.Item
      noStyle
      name='authenticationMethod'
      label={$t({ defaultMessage: 'Authentication Method' })}
      rules={[{ required: true }]}
      children={<Select
        placeholder={$t({ defaultMessage: 'Select an authentication method' })}
        children={options}
      />}
    />
  </Form.Item>
}

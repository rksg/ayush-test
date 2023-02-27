import { ReactNode, useEffect } from 'react'

import { Form, Select }                             from 'antd'
import { NamePath }                                 from 'antd/es/form/interface'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import {
  Loader,
  StepsFormNew,
  Tooltip,
  useStepFormContext
} from '@acx-ui/components'

import {
  authMethodsByClientType,
  authMethodsByCode
} from '../../authMethods'
import * as contents             from '../../contents'
import { useWlanAuthMethodsMap } from '../../services'
import {
  AuthenticationMethod as AuthenticationMethodEnum,
  NetworkHealthFormDto
} from '../../types'

import { ClientType } from './ClientType'
import { WlanName }   from './WlanName'

const fieldName = ['configs', 0, 'authenticationMethod'] as NamePath
const label = defineMessage({ defaultMessage: 'Authentication Method' })

export function AuthenticationMethod () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const map = useWlanAuthMethodsMap()
  const [code, clientType, wlanName] = [
    Form.useWatch(fieldName, form),
    Form.useWatch(ClientType.fieldName, form),
    Form.useWatch(WlanName.fieldName, form)
  ]
  const methods = authMethodsByClientType[clientType]

  let options: ReactNode = methods?.map(method => <Select.Option
    key={method.code}
    value={method.code}
    children={$t(method.title)}
  />)

  if (map.data?.[wlanName]?.length) {
    options = <>
      <Select.OptGroup
        key='suggested'
        label={$t({ defaultMessage: 'Suggested' })}
        children={map.data?.[wlanName]
          ?.map(code => authMethodsByCode[code])
          .map(method => <Select.Option
            key={`suggested-${method.code}`}
            value={method.code}
            children={$t(method.title)}
          />)
        }
      />
      <Select.OptGroup
        key='others'
        label={$t({ defaultMessage: 'Others' })}
        children={options}
      />
    </>
  }

  useEffect(() => {
    if (!code) return
    if (methods?.some(method => method.code === code)) return
    form.setFieldValue(fieldName, undefined)
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

  return <Loader style={{ height: 'auto', minHeight: 71 }} states={[map]}>
    <Form.Item required label={mainLabel}>
      <Form.Item
        noStyle
        name={fieldName}
        label={$t(label)}
        rules={[{ required: true }]}
        children={<Select
          placeholder={$t({ defaultMessage: 'Select an authentication method' })}
          children={options}
        />}
      />
    </Form.Item>
  </Loader>
}

AuthenticationMethod.fieldName = fieldName
AuthenticationMethod.label = label

AuthenticationMethod.FieldSummary = function AuthenticationMethodFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={fieldName}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary<AuthenticationMethodEnum>
      convert={(code) => $t(authMethodsByCode[code!].title)}
    />}
  />
}

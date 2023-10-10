import { ReactNode } from 'react'

import { Form, FormInstance, Select }               from 'antd'
import { NamePath }                                 from 'antd/es/form/interface'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import {
  Loader,
  StepsForm,
  Tooltip,
  useStepFormContext
} from '@acx-ui/components'

import {
  authMethodsByClientType,
  authMethodsByCode
} from '../../authMethods'
import * as contents             from '../../contents'
import { useNetworks }           from '../../services'
import {
  AuthenticationMethod as AuthenticationMethodEnum,
  ServiceGuardFormDto,
  ClientType as ClientTypeEnum
} from '../../types'

import { ClientType } from './ClientType'
import { Password }   from './Password'
import { Username }   from './Username'
import { WlanName }   from './WlanName'

const fieldName = ['configs', 0, 'authenticationMethod'] as NamePath
const label = defineMessage({ defaultMessage: 'Authentication Method' })

function reset (form: FormInstance, clientType: ClientTypeEnum) {
  const methods = authMethodsByClientType[clientType]
  const code = form.getFieldValue(fieldName)

  if (!methods.some(method => method.code === code))
    form.setFieldValue(fieldName, undefined)
}

export function AuthenticationMethod () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const { map, states } = useNetworks(true)
  const [clientType, wlanName] = [
    Form.useWatch(ClientType.fieldName, form),
    Form.useWatch(WlanName.fieldName, form)
  ]
  const methods = authMethodsByClientType[clientType]

  let options: ReactNode
  if (map[wlanName]?.authMethods.length) {
    const suggestedCodes = map[wlanName].authMethods
    const suggestedMethods = suggestedCodes?.map(code => authMethodsByCode[code])
    const othersMethods = methods.filter(method => !suggestedCodes?.includes(method.code))
    options = <>
      <Select.OptGroup
        key='suggested'
        label={$t({ defaultMessage: 'Suggested' })}
        children={suggestedMethods?.map(method => <Select.Option
          key={method.code}
          value={method.code}
          children={$t(method.title)}
        />)}
      />
      <Select.OptGroup
        key='others'
        label={$t({ defaultMessage: 'Others' })}
        children={othersMethods.map(method => <Select.Option
          key={method.code}
          value={method.code}
          children={$t(method.title)}
        />)}
      />
    </>
  } else {
    options = methods?.map(method => <Select.Option
      key={method.code}
      value={method.code}
      children={$t(method.title)}
    />)
  }

  const mainLabel = <>
    {$t(label)}
    <Tooltip.Question
      title={<FormattedMessage
        {...contents.unsupportedAuthMethods[clientType]}
        values={contents.formatValues}
      />}
    />
  </>

  return <Loader style={{ height: 'auto', minHeight: 71 }} states={states}>
    <Form.Item required label={mainLabel}>
      <Form.Item
        noStyle
        name={fieldName}
        label={$t(label)}
        rules={[{ required: true }]}
        children={<Select
          placeholder={$t({ defaultMessage: 'Select an authentication method' })}
          children={options}
          onChange={(code: AuthenticationMethodEnum) => {
            Username.reset(form, code)
            Password.reset(form, code)
          }}
        />}
      />
    </Form.Item>
  </Loader>
}

AuthenticationMethod.fieldName = fieldName
AuthenticationMethod.label = label
AuthenticationMethod.reset = reset

AuthenticationMethod.FieldSummary = function AuthenticationMethodFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={fieldName}
    label={$t(label)}
    children={<StepsForm.FieldSummary<AuthenticationMethodEnum>
      convert={(code) => $t(authMethodsByCode[code!].title)}
    />}
  />
}

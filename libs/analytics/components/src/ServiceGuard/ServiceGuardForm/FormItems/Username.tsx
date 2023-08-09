import { Form, FormInstance, Input } from 'antd'
import { NamePath }                  from 'antd/es/form/interface'
import { defineMessage, useIntl }    from 'react-intl'

import {
  StepsForm,
  useStepFormContext
} from '@acx-ui/components'

import { authMethodsByCode }                         from '../../authMethods'
import {
  ServiceGuardFormDto,
  AuthenticationMethod as AuthenticationMethodEnum
} from '../../types'

import { AuthenticationMethod } from './AuthenticationMethod'

const name = ['configs', 0, 'wlanUsername'] as const
const label = defineMessage({ defaultMessage: 'Username' })

function fieldOfCode (code?: AuthenticationMethodEnum) {
  const spec = code ? authMethodsByCode[code] : undefined
  return spec?.fields.find(field => field.key === 'wlanUsername')
}

const useField = () => {
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const code = Form.useWatch(AuthenticationMethod.fieldName as unknown as NamePath, form)

  return fieldOfCode(code)
}

function reset (form: FormInstance, code: AuthenticationMethodEnum) {
  const field = fieldOfCode(code)

  if (!field) form.setFieldValue(name as unknown as NamePath, undefined)
}

export function Username () {
  const { $t } = useIntl()
  const field = useField()

  if (!field) return null

  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    rules={[{ required: true }]}
    children={<Input />}
  />
}

Username.fieldName = name
Username.label = label
Username.reset = reset

Username.FieldSummary = function UsernameFieldSummary () {
  const { $t } = useIntl()
  const field = useField()

  if (!field) return null

  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    children={<StepsForm.FieldSummary />}
  />
}

import { useEffect } from 'react'

import { Form, Input }            from 'antd'
import { NamePath }               from 'antd/es/form/interface'
import { defineMessage, useIntl } from 'react-intl'

import {
  StepsFormNew,
  useStepFormContext
} from '@acx-ui/components'

import { authMethodsByCode }    from '../../authMethods'
import { NetworkHealthFormDto } from '../../types'

import { AuthenticationMethod } from './AuthenticationMethod'

const name = ['configs', 0, 'wlanUsername'] as const
const label = defineMessage({ defaultMessage: 'Username' })

const useField = () => {
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const code = Form.useWatch(AuthenticationMethod.fieldName as unknown as NamePath, form)

  const spec = authMethodsByCode[code]
  const field = spec?.fields.find(field => field.key === 'wlanUsername')

  return { field, form }
}

export function Username () {
  const { $t } = useIntl()
  const { field, form } = useField()
  const fieldName = name as unknown as NamePath

  useEffect(() => {
    if (field) return

    form.setFieldValue(fieldName, undefined)
  }, [form, field, fieldName])

  if (!field) return null

  return <Form.Item
    name={fieldName}
    label={$t(label)}
    rules={[{ required: true }]}
    children={<Input />}
  />
}

Username.fieldName = name
Username.label = label

Username.FieldSummary = function UsernameFieldSummary () {
  const { $t } = useIntl()
  const { field } = useField()

  if (!field) return null

  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary />}
  />
}

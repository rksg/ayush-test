import { useEffect } from 'react'

import { Form, Input }            from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  StepsFormNew,
  useStepFormContext,
  useWatch
} from '@acx-ui/components'

import { authMethodsByCode }    from '../../authMethods'
import { NetworkHealthFormDto } from '../../types'

const name = 'wlanUsername' as const
const label = defineMessage({ defaultMessage: 'Username' })

const useField = () => {
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const code = useWatch('authenticationMethod', form)

  const spec = authMethodsByCode[code]
  const field = spec?.fields.find(field => field.key === name)

  return { field, form }
}

export function Username () {
  const { $t } = useIntl()
  const { field, form } = useField()

  useEffect(() => {
    if (field) return

    form.setFieldValue(name, undefined)
  }, [form, field])

  if (!field) return null

  return <Form.Item
    name={name}
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
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary />}
  />
}

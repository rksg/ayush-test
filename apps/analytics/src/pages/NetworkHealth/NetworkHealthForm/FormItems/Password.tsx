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

const name = ['configs', 0, 'wlanPassword'] as const
const label = defineMessage({ defaultMessage: 'Password' })
const labelAlt = defineMessage({ defaultMessage: 'Pre-Shared Key' })

function fieldOfCode (code?: NetworkHealthFormDto['configs'][0]['authenticationMethod']) {
  const spec = code ? authMethodsByCode[code] : undefined
  return spec?.fields.find(field => field.key === 'wlanPassword')
}

const useField = () => {
  const { $t } = useIntl()
  const { editMode, form, initialValues } = useStepFormContext<NetworkHealthFormDto>()
  const code = Form.useWatch(AuthenticationMethod.fieldName as unknown as NamePath, form)

  const field = fieldOfCode(code)
  const previousField = fieldOfCode(initialValues?.configs?.[0].authenticationMethod)

  if (!field) return { form, field }

  let required = !Boolean(field.preConfigured)
  if (editMode && !field.preConfigured) required = false

  let placeholder: string | undefined = undefined
  if (field.preConfigured) placeholder = $t({ defaultMessage: 'Using configured password' })
  if (editMode &&
    // ensure previous auth method really has password field
    previousField &&
    // then check that it wasn't preconfigured
    !previousField.preConfigured
  ) {
    placeholder = $t({ defaultMessage: 'Leave blank to remain unchanged' })
  }

  let disabled = false
  if (field.preConfigured) disabled = true

  return { form, field, placeholder, disabled, required }
}

export function Password () {
  const { $t } = useIntl()
  const { form, field, disabled, placeholder, required } = useField()
  const fieldName = name as unknown as NamePath

  useEffect(() => {
    if (field && !field.preConfigured) return

    form.setFieldValue(fieldName, undefined)
  }, [form, field, fieldName])

  if (!field) return null

  const children = field.preConfigured
    ? <StepsFormNew.FieldSummary convert={() => String(placeholder)} />
    : <Input.Password {...{ placeholder, disabled }} />

  return <Form.Item
    name={fieldName}
    label={$t(field.preConfigured ? labelAlt : label)}
    rules={[{ required }]}
    children={children}
  />
}

Password.fieldName = name
Password.label = label
Password.labelAlt = labelAlt

Password.FieldSummary = function PasswordFieldSummary () {
  const { $t } = useIntl()
  const { field } = useField()

  if (!field) return null

  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(field.preConfigured ? labelAlt : label)}
    children={<StepsFormNew.FieldSummary<string>
      convert={(value) => field.preConfigured
        ? $t({ defaultMessage: 'Using configured password' })
        : Array(String(value).length).fill('*').join('')}
    />}
  />
}

import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import {
  StepsFormNew,
  useStepFormContext,
  useWatch
} from '@acx-ui/components'

import { authMethodsByCode }    from '../../authMethods'
import { NetworkHealthFormDto } from '../../types'

const key = 'wlanPassword'

function fieldOfCode (code?: NetworkHealthFormDto['authenticationMethod']) {
  const spec = code ? authMethodsByCode[code] : undefined
  return spec?.fields.find(field => field.key === key)
}

export function Password () {
  const { $t } = useIntl()
  const { editMode, form, initialValues } = useStepFormContext<NetworkHealthFormDto>()
  const code = useWatch('authenticationMethod', form)

  const field = fieldOfCode(code)
  const previousField = fieldOfCode(initialValues?.authenticationMethod)

  useEffect(() => {
    if (field && !field.preConfigured) return

    form.setFieldValue(key, undefined)
  }, [form, field])

  if (!field) return null

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

  const children = field.preConfigured
    ? <StepsFormNew.FieldSummary convert={() => String(placeholder)} />
    : <Input.Password {...{ placeholder, disabled }} />

  return <Form.Item
    name={key}
    label={$t(field.title)}
    rules={[{ required }]}
    children={children}
  />
}

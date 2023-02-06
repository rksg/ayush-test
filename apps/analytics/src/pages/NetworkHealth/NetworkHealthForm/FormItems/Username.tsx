import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import {
  useStepFormContext,
  useWatch
} from '@acx-ui/components'

import { authMethodsByCode }    from '../../authMethods'
import { NetworkHealthFormDto } from '../../types'

export function Username () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const code = useWatch('authenticationMethod', form)
  const key = 'wlanUsername'

  const spec = authMethodsByCode[code]
  const field = spec?.fields.find(field => field.key === key)

  useEffect(() => {
    if (field) return

    form.setFieldValue(key, undefined)
  }, [form, field])

  if (!field) return null

  return <Form.Item
    name={key}
    label={$t(field.title)}
    rules={[{ required: true }]}
    children={<Input />}
  />
}

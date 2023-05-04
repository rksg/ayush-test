import { Form, Input }            from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { StepsFormNew } from '@acx-ui/components'

import { useDuplicateNameValidator } from '../../services'

const name = 'name' as const
const label = defineMessage({ defaultMessage: 'Test Call Name' })

export function TestName () {
  const { $t } = useIntl()
  const duplicateNameValidator = useDuplicateNameValidator()

  return <Form.Item
    hasFeedback
    validateFirst
    name={name}
    label={$t(label)}
    rules={[
      { required: true },
      { validator: duplicateNameValidator }
    ]}
    children={<Input />}
  />
}

TestName.fieldName = name
TestName.label = label

TestName.FieldSummary = function TestNameFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary />}
  />
}

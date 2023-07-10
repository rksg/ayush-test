import { Form, Input }            from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

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
      { max: 255 },
      { validator: duplicateNameValidator }
    ]}
    children={<Input />}
    validateTrigger={'onBlur'}
  />
}

TestName.fieldName = name
TestName.label = label

TestName.FieldSummary = function TestNameFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsForm.FieldSummary />}
  />
}

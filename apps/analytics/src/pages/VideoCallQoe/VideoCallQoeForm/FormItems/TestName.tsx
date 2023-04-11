import { Form, Input }            from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { StepsFormNew } from '@acx-ui/components'

//import { useDuplicateNameValidator } from '../../services'

const name = 'name' as const
const label = defineMessage({ defaultMessage: 'Test Name' })

export function TestName () {
  const { $t } = useIntl()
  //const { editMode, initialValues } = useStepFormContext<{ name: string }>()
  //const duplicateNameValidator = useDuplicateNameValidator(editMode, initialValues?.name)

  return <Form.Item
    hasFeedback
    validateFirst
    name={name}
    label={$t(label)}
    rules={[
      { required: true }
      // { validator: duplicateNameValidator }
    ]}
    children={<Input />}
  />
}

TestName.fieldName = name
TestName.label = label

TestName.FieldSummary = function TestNameFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    style={{ padding: -5 }}
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary />}
  />
}

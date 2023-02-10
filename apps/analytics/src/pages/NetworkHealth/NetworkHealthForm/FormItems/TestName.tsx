import { Form, Input }            from 'antd'
import { ValidatorRule }          from 'rc-field-form/lib/interface'
import { defineMessage, useIntl } from 'react-intl'

import { StepsFormNew, useStepFormContext } from '@acx-ui/components'

import { messageMapping }                     from '../../contents'
import { useLazyNetworkHealthSpecNamesQuery } from '../../services'

const name = 'name' as const
const label = defineMessage({ defaultMessage: 'Test Name' })

export function TestName () {
  const { $t } = useIntl()
  const [getNames] = useLazyNetworkHealthSpecNamesQuery()
  const { editMode, initialValues } = useStepFormContext<{ name: string }>()

  const duplicateNameValidator: ValidatorRule['validator'] = async (rule, value: string) => {
    if (editMode && initialValues?.name === value) return

    const names = await getNames(undefined).unwrap()
    if (!names.includes(value)) return

    throw new Error($t(messageMapping.DUPLICATE_NAME_NOT_ALLOWED))
  }

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

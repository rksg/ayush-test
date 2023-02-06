import { Form, Input }   from 'antd'
import { ValidatorRule } from 'rc-field-form/lib/interface'
import { useIntl }       from 'react-intl'

import { useStepFormContext } from '@acx-ui/components'

import { errorMsgMapping }                    from '../../contents'
import { useLazyNetworkHealthSpecNamesQuery } from '../../services'

export function TestName () {
  const { $t } = useIntl()
  const [getNames] = useLazyNetworkHealthSpecNamesQuery()
  const { editMode, initialValues } = useStepFormContext<{ name: string }>()

  const duplicateNameValidator: ValidatorRule['validator'] = async (rule, value: string) => {
    if (editMode && initialValues?.name === value) return

    const names = await getNames(undefined).unwrap()
    if (!names.includes(value)) return

    throw new Error($t(errorMsgMapping.DUPLICATE_NAME_NOT_ALLOWED))
  }

  return <Form.Item
    hasFeedback
    validateFirst
    name='name'
    label={$t({ defaultMessage: 'Test Name' })}
    rules={[
      { required: true },
      { validator: duplicateNameValidator }
    ]}
    children={<Input />}
  />
}

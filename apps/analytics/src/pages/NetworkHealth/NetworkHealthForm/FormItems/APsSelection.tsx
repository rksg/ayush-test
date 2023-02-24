import { Form, Input }            from 'antd'
import { NamePath }               from 'antd/es/form/interface'
import { defineMessage, useIntl } from 'react-intl'

import { StepsFormNew } from '@acx-ui/components'

const APSelectionInput = Input.TextArea

const name = ['configs', 0, 'networkPaths', 'networkNodes'] as const
const label = defineMessage({ defaultMessage: 'APs Selection' })

export function APsSelection () {
  return <Form.Item
    name={name as unknown as NamePath}
    rules={[
      { required: true }
    ]}
    children={<APSelectionInput />}
  />
}

APsSelection.fieldName = name
APsSelection.label = label

APsSelection.FieldSummary = function APsSelectionFieldSummary () {
  const { $t } = useIntl()
  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    // Get total number of APs selected
    children={<StepsFormNew.FieldSummary />}
  />
}

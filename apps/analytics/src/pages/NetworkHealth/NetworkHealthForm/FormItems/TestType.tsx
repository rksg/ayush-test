import { Form, Select }           from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { StepsFormNew } from '@acx-ui/components'

import * as contents                from '../../contents'
import { TestType as TestTypeEnum } from '../../types'

const name = 'type' as const
const label = defineMessage({ defaultMessage: 'Test Type' })

export function TestType () {
  const { $t } = useIntl()
  const options = [
    TestTypeEnum.OnDemand,
    TestTypeEnum.Scheduled
  ].map(type => <Select.Option
    key={type}
    value={type}
    children={$t(contents.testTypes[type])}
  />)

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<Select disabled>{options}</Select>}
  />
}

TestType.fieldName = name
TestType.label = label

TestType.FieldSummary = function TestTypeFieldSummary () {
  const { $t } = useIntl()
  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary<TestTypeEnum>
      convert={(value) => $t(contents.testTypes[value!])}
    />}
  />
}

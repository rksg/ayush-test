import { Form, Select, Input }    from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  StepsForm,
  useStepFormContext
} from '@acx-ui/components'

import * as contents     from '../../contents'
import {
  ServiceGuardFormDto,
  TestType as TestTypeEnum,
  TestTypeWithSchedule
} from '../../types'

import { Schedule } from './Schedule'

const name = 'type' as const
const label = defineMessage({ defaultMessage: 'Test Type' })

export function TestType () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<ServiceGuardFormDto>()

  return <>
    <Form.Item
      name='typeWithSchedule'
      label={$t(label)}
      rules={[{ required: true }]}
      children={<Select
        placeholder={$t({ defaultMessage: 'Select a test type' })}
        children={Object.keys(contents.testTypesWithSchedule).map(type => <Select.Option
          key={type}
          value={type}
          children={$t(contents.testTypesWithSchedule[type])}
        />)}
        onChange={(typeWithSchedule: TestTypeWithSchedule) => {
          const type = typeWithSchedule === TestTypeEnum.OnDemand
            ? TestTypeEnum.OnDemand
            : TestTypeEnum.Scheduled
          form.setFieldValue(name, type)
          Schedule.reset(form, typeWithSchedule)
        }}
      />}
    />
    <Form.Item name={name} hidden><Input /></Form.Item>
  </>
}

TestType.fieldName = name
TestType.label = label

TestType.FieldSummary = function TestTypeFieldSummary () {
  const { $t } = useIntl()
  return <Form.Item
    name='typeWithSchedule'
    label={$t(label)}
    children={<StepsForm.FieldSummary<TestTypeEnum>
      convert={(value) => $t(contents.testTypesWithSchedule[value!])}
    />}
  />
}

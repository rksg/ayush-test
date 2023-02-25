import { useEffect } from 'react'

import { Form, Select, Input }    from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  StepsFormNew,
  useStepFormContext
} from '@acx-ui/components'

import * as contents                                      from '../../contents'
import { NetworkHealthFormDto, TestType as TestTypeEnum } from '../../types'

import { Schedule } from './Schedule'

const name = 'type' as const
const label = defineMessage({ defaultMessage: 'Test Type' })

export function TestType () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const typeWithSchedule = Form.useWatch('typeWithSchedule', form)
  const type = typeWithSchedule && typeWithSchedule === TestTypeEnum.OnDemand
    ? TestTypeEnum.OnDemand
    : TestTypeEnum.Scheduled

  useEffect(() => {
    form.setFieldValue(name, type)
  }, [type, form])

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
        onChange={(typeWithSchedule) => {
          if (typeWithSchedule === TestTypeEnum.OnDemand) {
            form.setFieldValue([Schedule.fieldName, 'frequency'], null)
            form.setFieldValue([Schedule.fieldName, 'day'], null)
            form.setFieldValue([Schedule.fieldName, 'hour'], null)
          } else {
            form.setFieldValue([Schedule.fieldName, 'frequency'], typeWithSchedule)
            form.setFieldValue([Schedule.fieldName, 'day'], null)
          }
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
    children={<StepsFormNew.FieldSummary<TestTypeEnum>
      convert={(value) => $t(contents.testTypesWithSchedule[value!])}
    />}
  />
}

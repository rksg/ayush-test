import {
  Form,
  FormInstance,
  Row,
  Input
} from 'antd'

import {
  defineMessage,
  useIntl
} from 'react-intl'

import {
  StepsForm,
  Tooltip,
  useStepFormContext,
  TimeDropdown,
  getDisplayTime
} from '@acx-ui/components'

import * as contents     from '../../contents'
import {
  ServiceGuardFormDto,
  Schedule as ScheduleType,
  ScheduleFrequency,
  TestType,
  TestTypeWithSchedule
} from '../../types'

const name = 'schedule' as const
const label = defineMessage({ defaultMessage: 'Schedule' })

const useTypeWithSchedule = () => {
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  return Form.useWatch('typeWithSchedule', form)
}

function reset (form: FormInstance, typeWithSchedule: TestTypeWithSchedule) {
  if (typeWithSchedule === TestType.OnDemand) {
    form.setFieldValue([name, 'frequency'], null)
    form.setFieldValue([name, 'day'], null)
    form.setFieldValue([name, 'hour'], null)
  } else {
    form.setFieldValue([name, 'frequency'], typeWithSchedule)
    form.setFieldValue([name, 'day'], null)
  }
}

export function Schedule () {
  const { $t } = useIntl()
  const typeWithSchedule = useTypeWithSchedule()
  // const { Daily, Weekly, Monthly } = TimeDropdown();

  if (!typeWithSchedule || typeWithSchedule === TestType.OnDemand) return null

  return <>
    <Form.Item name={[name, 'type']} hidden><Input /></Form.Item>
    <Form.Item name={[name, 'timezone']} hidden><Input /></Form.Item>
    <Form.Item name={[name, 'frequency']} hidden><Input /></Form.Item>
    <Form.Item
      label={<>
        {$t(label)}
        {
          typeWithSchedule === ScheduleFrequency.Monthly &&
            <Tooltip.Question title={$t(contents.scheduleMonthlyTooltip)} />
        }
      </>}
      required
    >
      <Row align='middle' justify='center'>
      {
          typeWithSchedule === ScheduleFrequency.Daily &&
          <TimeDropdown timeType='Daily' name={name} />
        }
        {
          typeWithSchedule === ScheduleFrequency.Weekly &&
          <TimeDropdown timeType='Weekly' name={name} />
        }
        {
          typeWithSchedule === ScheduleFrequency.Monthly &&
          <TimeDropdown timeType='Monthly' name={name} />
        }
      </Row>
    </Form.Item>
  </>
}

Schedule.fieldName = name
Schedule.label = label
Schedule.reset = reset

Schedule.FieldSummary = function ScheduleFieldSummary () {
  const { $t } = useIntl()
  const typeWithSchedule = useTypeWithSchedule()

  if (!typeWithSchedule || typeWithSchedule === TestType.OnDemand) return null

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsForm.FieldSummary<ScheduleType> convert={(value) => {
      switch (value!.frequency) {
        case ScheduleFrequency.Daily:
          return getDisplayTime.Daily(value?.hour!)
        case ScheduleFrequency.Weekly:
          return getDisplayTime.Weekly(value?.day!,value?.hour!)
        default:
          return getDisplayTime.Monthly(value?.day!,value?.hour!)
      }
    }}/>}
  />
}

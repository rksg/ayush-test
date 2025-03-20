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
  getDisplayTime,
  DayTimeDropdown
} from '@acx-ui/components'

import * as contents      from '../../contents'
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
          <TimeDropdown name={[name, 'hour']} spanLength={24} />
        }
        {
          typeWithSchedule === ScheduleFrequency.Weekly &&
          <DayTimeDropdown type={ScheduleFrequency.Weekly}
            name={name}
            spanLength={11}
          />
        }
        {
          typeWithSchedule === ScheduleFrequency.Monthly &&
          <DayTimeDropdown type={ScheduleFrequency.Monthly}
            name={name}
            spanLength={11}
          />
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
          const dailyDisplayFn =
            getDisplayTime(ScheduleFrequency.Daily) as (hour: number) => string | undefined
          return dailyDisplayFn(value?.hour!)
        case ScheduleFrequency.Weekly:
          return getDisplayTime(ScheduleFrequency.Weekly)(value?.day!,value?.hour!)
        default:
          return getDisplayTime(ScheduleFrequency.Monthly)(value?.day!,value?.hour!)
      }
    }}/>}
  />
}

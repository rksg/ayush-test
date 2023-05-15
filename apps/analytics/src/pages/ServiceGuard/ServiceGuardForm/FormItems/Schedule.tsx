import {
  Form,
  FormInstance,
  Row,
  Col,
  Select,
  Input
} from 'antd'
import moment from 'moment-timezone'
import {
  FormattedMessage,
  defineMessage,
  useIntl
} from 'react-intl'

import {
  StepsForm,
  Tooltip,
  useStepFormContext
} from '@acx-ui/components'

import * as contents     from '../../contents'
import {
  ServiceGuardFormDto,
  Schedule as ScheduleType,
  ScheduleFrequency,
  TestType,
  TestTypeWithSchedule
} from '../../types'
import * as UI from '../styledComponents'

const name = 'schedule' as const
const label = defineMessage({ defaultMessage: 'Schedule' })

function timeMap () {
  const timeMap = new Map<number, string>()
  const times = [...Array.from(Array(96), (_, i) => {
    const designator = moment().format('UTCZ').replace(':00', '')
    return moment().hour(0).minute(0).add(i * 15, 'minute').format(`HH:mm (${designator})`)
  })]
  times.forEach((time, i) => timeMap.set(i / 4, time))
  return timeMap
}
function timeOptions () {
  const timeOptions = []
  for (const [value, hour] of timeMap().entries()) {
    timeOptions.push(<Select.Option value={+value} key={hour} children={hour} />)
  }
  return timeOptions
}

function dayOfWeekMap () {
  const dayOfWeekMap = new Map<number, string>()
  const weekDays = moment.weekdays()
  weekDays.push(weekDays.shift() as string)
  weekDays.forEach((day, i) => dayOfWeekMap.set(i === 6 ? 0 : i + 1, day))
  return dayOfWeekMap
}
function dayOfWeekOptions () {
  const dayOfWeekOptions = []
  for (const [value, day] of dayOfWeekMap().entries()) {
    dayOfWeekOptions.push(<Select.Option value={+value} key={day} children={day} />)
  }
  return dayOfWeekOptions
}

function dayOfMonthMap () {
  const dayOfMonthMap = new Map<number, string>()
  const monthDays = [...Array.from(Array(31), (_, i) =>
    moment(`2021-1-${i + 1}`, 'YYYY-MM-DD').format('Do')
  )]
  monthDays.forEach((day, i) => dayOfMonthMap.set(i + 1, day))
  return dayOfMonthMap
}
function dayOfMonthOptions () {
  const dayOfMonthOptions = []
  for (const [value, day] of dayOfMonthMap().entries()) {
    dayOfMonthOptions.push(<Select.Option value={+value} key={day} children={day} />)
  }
  return dayOfMonthOptions
}

const useTypeWithSchedule = () => {
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  return Form.useWatch('typeWithSchedule', form)
}

const atDayHour = defineMessage({
  defaultMessage: '<day></day> <at>at</at> <hour></hour>'
})

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
            <Col span={24}>
              <Form.Item
                name={[name, 'hour']}
                rules={[{ required: true, message: $t({ defaultMessage: 'Please enter hour' }) }]}
                noStyle
              >
                <Select
                  placeholder={$t({ defaultMessage: 'Select hour' })}
                  children={timeOptions()}
                />
              </Form.Item>
            </Col>
        }
        {
          typeWithSchedule === ScheduleFrequency.Weekly && <FormattedMessage {...atDayHour}
            values={{
              day: () => <Col span={11}>
                <Form.Item
                  name={[name, 'day']}
                  rules={[{ required: true, message: $t({ defaultMessage: 'Please enter day' }) }]}
                  noStyle
                >
                  <Select
                    placeholder={$t({ defaultMessage: 'Select day' })}
                    children={dayOfWeekOptions()}
                  />
                </Form.Item>
              </Col>,
              at: (children) => <UI.AtCol span={2} children={children} />,
              hour: () => <Col span={11}>
                <Form.Item
                  name={[name, 'hour']}
                  rules={[{ required: true, message: $t({ defaultMessage: 'Please enter hour' }) }]}
                  noStyle
                >
                  <Select
                    placeholder={$t({ defaultMessage: 'Select hour' })}
                    children={timeOptions()}
                  />
                </Form.Item>
              </Col>
            }}
          />
        }
        {
          typeWithSchedule === ScheduleFrequency.Monthly && <FormattedMessage {...atDayHour}
            values={{
              day: () => <Col span={11}>
                <Form.Item
                  name={[name, 'day']}
                  rules={[{ required: true, message: $t({ defaultMessage: 'Please enter day' }) }]}
                  noStyle
                >
                  <Select
                    placeholder={$t({ defaultMessage: 'Select day' })}
                    children={dayOfMonthOptions()}
                  />
                </Form.Item>
              </Col>,
              at: (children) => <UI.AtCol span={2} children={children} />,
              hour: () => <Col span={11}>
                <Form.Item
                  name={[name, 'hour']}
                  rules={[{ required: true, message: $t({ defaultMessage: 'Please enter hour' }) }]}
                  noStyle
                >
                  <Select
                    placeholder={$t({ defaultMessage: 'Select hour' })}
                    children={timeOptions()}
                  />
                </Form.Item>
              </Col>
            }}
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
          return timeMap().get(value!.hour!)
        case ScheduleFrequency.Weekly:
          return <FormattedMessage {...atDayHour}
            values={{
              day: () => dayOfWeekMap().get(value!.day!),
              at: (text) => text,
              hour: () => timeMap().get(value!.hour!)
            }}
          />
        default:
          return <FormattedMessage {...atDayHour}
            values={{
              day: () => dayOfMonthMap().get(value!.day!),
              at: (text) => text,
              hour: () => timeMap().get(value!.hour!)
            }}
          />
      }
    }}/>}
  />
}

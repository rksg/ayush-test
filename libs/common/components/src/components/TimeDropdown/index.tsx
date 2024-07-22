import { Form, Col, Select } from 'antd';

import {
  FormattedMessage,
  defineMessage,
  useIntl
} from 'react-intl'

import * as UI from './styledComponents'
import moment from 'moment';

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

  const atDayHour = defineMessage({
    defaultMessage: '<day></day> <at>at</at> <hour></hour>'
  })


export const getDisplayTime =
{
  Daily: (value) => (timeMap().get(value!.hour!)),
  Weekly: (value) => (
    <FormattedMessage {...atDayHour}
      values={{
        day: () => dayOfWeekMap().get(value!.day!),
        at: (text) => text,
        hour: () => timeMap().get(value!.hour!)
      }}
    />
  ),
  Monthly: (value) => (
    <FormattedMessage {...atDayHour}
      values={{
        day: () => dayOfMonthMap().get(value!.day!),
        at: (text) => text,
        hour: () => timeMap().get(value!.hour!)
      }}
    />
  )
}


export function TimeDropdown () {

  const { $t } = useIntl()

  const DailySchedule = ({ name }) => (
    <Col span={24}>
      <Form.Item
        name={[name, 'hour']}
        rules={[{ required: true, message: $t({ defaultMessage: 'Please enter hour' }) }]}
        noStyle
      >
        <Select placeholder={$t({ defaultMessage: 'Select hour' })}>
          {timeOptions()}
        </Select>
      </Form.Item>
    </Col>
)

  const WeeklySchedule = ({ name }) => (
    <FormattedMessage {...atDayHour}
      values={{
        day: () => (
          <Col span={11}>
            <Form.Item
              name={[name, 'day']}
              rules={[{ required: true, message: $t({ defaultMessage: 'Please enter day' }) }]}
              noStyle
            >
              <Select placeholder={$t({ defaultMessage: 'Select day' })}>
                {dayOfWeekOptions()}
              </Select>
            </Form.Item>
          </Col>
        ),
        at: (children) => <UI.AtCol span={2}>{children}</UI.AtCol>,
        hour: () => (
          <Col span={11}>
            <Form.Item
              name={[name, 'hour']}
              rules={[{ required: true, message: $t({ defaultMessage: 'Please enter hour' }) }]}
              noStyle
            >
              <Select placeholder={$t({ defaultMessage: 'Select hour' })}>
                {timeOptions()}
              </Select>
            </Form.Item>
          </Col>
        )
      }}
    />
  )

  const MonthlySchedule = ({ name }) => (
    <FormattedMessage {...atDayHour}
      values={{
        day: () => (
          <Col span={11}>
            <Form.Item
              name={[name, 'day']}
              rules={[{ required: true, message: $t({ defaultMessage: 'Please enter day' }) }]}
              noStyle
            >
              <Select placeholder={$t({ defaultMessage: 'Select day' })}>
                {dayOfMonthOptions()}
              </Select>
            </Form.Item>
          </Col>
        ),
        at: (children) => <UI.AtCol span={2}>{children}</UI.AtCol>,
        hour: () => (
          <Col span={11}>
            <Form.Item
              name={[name, 'hour']}
              rules={[{ required: true, message: $t({ defaultMessage: 'Please enter hour' }) }]}
              noStyle
            >
              <Select placeholder={$t({ defaultMessage: 'Select hour' })}>
                {timeOptions()}
              </Select>
            </Form.Item>
          </Col>
        )
      }}
    />
  )
  return { DailySchedule, WeeklySchedule, MonthlySchedule };
}
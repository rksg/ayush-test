import React from 'react'

import { Form, Col, Select, SelectProps } from 'antd'
import { NamePath }                       from 'antd/lib/form/interface'
import { castArray  }                     from 'lodash'
import moment                             from 'moment'
import {
  FormattedMessage,
  defineMessage,
  useIntl
} from 'react-intl'

import * as UI from './styledComponents'

export enum DayAndTimeDropdownTypes {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly'
}


export enum DayTimeDropdownTypes {
  Weekly = 'weekly',
  Monthly = 'monthly'
}

function timeMap () {
  const timeMap = new Map<number, string>()
  const times = [...Array.from(Array(96), (_, i) => {
    const designator = moment().format('UTCZ').replace(':00', '')
    return moment().hour(0).minute(0).add(i * 15, 'minute').format(`HH:mm (${designator})`)
  })]
  times.forEach((time, i) => timeMap.set(i / 4, time))
  return timeMap
}

function timeOptions (disabledStrictlyBefore: number, disabledStrictlyAfter: number) {
  const timeOptions = []
  for (const [value, hour] of timeMap().entries()) {
    if (value >= disabledStrictlyBefore &&
    value <= disabledStrictlyAfter) {
      timeOptions.push(<Select.Option value={+value} key={hour} children={hour} />)
    }
    else {
      timeOptions.push(<Select.Option value={+value}
        key={hour}
        children={hour}
        disabled={true}/>)
    }
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

export function getDisplayTime (type: DayAndTimeDropdownTypes) {
  return {
    daily: (hour: number) => (timeMap().get(hour)),
    weekly: (day: number, hour: number) => (
      <FormattedMessage {...atDayHour}
        values={{
          day: () => dayOfWeekMap().get(day),
          at: (text) => text,
          hour: () => timeMap().get(hour)
        }}
      />
    ),
    monthly: (day: number, hour: number) => (
      <FormattedMessage {...atDayHour}
        values={{
          day: () => dayOfMonthMap().get(day),
          at: (text) => text,
          hour: () => timeMap().get(hour)
        }}
      />
    )
  }[type]
}

const defaultDisabledTime =
{ disabledStrictlyBefore: 0, disabledStrictlyAfter: 24 }


interface TimeDropdownProps {
  name: NamePath
  disabledDateTime?: {
    disabledStrictlyBefore?: number,
    disabledStrictlyAfter?: number
  }
  spanLength: number
}

interface DayTimeDropdownProps {
  type: Omit<DayAndTimeDropdownTypes, DayAndTimeDropdownTypes.Daily>
  name: NamePath
  spanLength: number
}

export function DayTimeDropdown ({ type, name, spanLength }: DayTimeDropdownProps) {
  const { $t } = useIntl()
  return (
    <FormattedMessage {...atDayHour}
      values={{
        day: () => (
          <Col span={spanLength}>
            <Form.Item
              name={[...castArray(name), 'day']}
              rules={[{ required: true, message: $t({ defaultMessage: 'Please enter day' }) }]}
              noStyle
            >
              <Select placeholder={$t({ defaultMessage: 'Select day' })}>
                {type === DayTimeDropdownTypes.Weekly ? dayOfWeekOptions() : dayOfMonthOptions()}
              </Select>
            </Form.Item>
          </Col>
        ),
        at: (children) => <UI.AtCol span={2}>{children}</UI.AtCol>,
        hour: () => <TimeDropdown
          name={[...castArray(name), 'hour']}
          spanLength={spanLength}
        />
      }}
    />
  )
}


export function TimeDropdown (props: TimeDropdownProps) {
  const { $t } = useIntl()
  const { name, disabledDateTime, spanLength } = props

  return <Col span={spanLength}>
    <Form.Item
      noStyle
      name={name}
      rules={[{ required: true, message: $t({ defaultMessage: 'Please enter hour' }) }]}
      children={<TimeDropdownPlain
        {...{ disabledDateTime }}
        placeholder={$t({ defaultMessage: 'Select hour' })}
      />}
    />
  </Col>
}

export function TimeDropdownPlain ({
  disabledDateTime,
  ...props
}: Omit<SelectProps, 'children'> & {
  disabledDateTime?: {
    disabledStrictlyBefore?: number,
    disabledStrictlyAfter?: number
  }
}) {
  const disabledStrictlyBefore = disabledDateTime?.disabledStrictlyBefore
    ?? defaultDisabledTime.disabledStrictlyBefore
  const disabledStrictlyAfter = disabledDateTime?.disabledStrictlyAfter
    ?? defaultDisabledTime.disabledStrictlyAfter

  return <Select
    {...props}
    children={timeOptions(disabledStrictlyBefore, disabledStrictlyAfter)}
  />
}

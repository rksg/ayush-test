import React, { MutableRefObject, useRef, useState } from 'react'

import { $CombinedState }                         from '@reduxjs/toolkit'
import { Row, Col, Typography, Form, DatePicker } from 'antd'
import { DatePickerProps, RangePickerProps }      from 'antd/lib/date-picker'
import { NamePath }                               from 'antd/lib/form/interface'
import dayjs                                      from 'dayjs'
import moment, { Moment }                         from 'moment-timezone'
import { data }                                   from 'msw/lib/types/context'
import { defineMessage, useIntl }                 from 'react-intl'

import { StepsForm, TimeDropdown, TimeDropdownTypes, useLayoutContext, useStepFormContext } from '@acx-ui/components'

import { IntentAIFormDto } from '../../types'
import * as UI             from '../styledComponents'

import { IntentPriority, Priority } from './priority'

import { steps, crrmIntent, isOptimized } from '.'

const name = 'settings' as NamePath
const label = defineMessage({ defaultMessage: 'Settings' })


interface DateTimeDropdownProps {
  initialDate: Moment
  time: MutableRefObject<number>,
  disabledDate:(value: Moment) => boolean
  onchange: DatePickerProps['onChange']
}

export const DateTimeDropdown = (
  {
    initialDate,
    time,
    disabledDate,
    onchange
  } : DateTimeDropdownProps) => {
  const [date, setDate] = useState(() => initialDate)
  const [open, setOpen] = useState(true)
  const { $t } = useIntl()
  return (
    <>
      <DatePicker
        style={{ width: '100%' }}
        picker='date'
        value={date}
        showTime={false}
        showToday={false}
        disabledDate={disabledDate}
        onChange={(e,i) => {
          onchange!(e,i)
          setOpen(false)
          setDate(e!)
        }}
      />

      <Form.Item
        label={$t(defineMessage({ defaultMessage: 'Schedule Time' }))}
        children={
          <TimeDropdown type={TimeDropdownTypes.Daily} // if date is today, disable before current, else no disable
            name={name as string}
            disabledDateTime={
              { disabledStrictlyBefore: time.current }
            }
          />
        }
      />
    </>
  )
}

function DateTimeSetting ({
  scheduledDate,
  scheduledTime
}: DateTimeSettingProps) {
  const { $t } = useIntl()
  const initialDate = moment(scheduledDate)
  const initialTime = useRef(scheduledTime)
  const { form } = useStepFormContext<IntentAIFormDto>()
  const disabledDate : RangePickerProps['disabledDate']= (current) => {
    return current && current < dayjs().startOf('day')
  }
  const onChange: DatePickerProps['onChange'] = (date) => {
    console.log(date)
    form.setFieldValue(['settings', 'date'], date)
  }
  return (
    <Form.Item name={['settings', 'date']}
      label={$t(defineMessage({ defaultMessage: 'Schedule Date' }))}
      children={
        <DateTimeDropdown
          initialDate={initialDate} // initial date from scheduledAt if  any
          time={initialTime}
          disabledDate={disabledDate} // disable all date before current
          onchange={onChange}
        />
      }
    />
  )}

type DateTimeSettingProps = {
  scheduledDate: string
  scheduledTime: number
}

const scheduleActions = {
  datetime: (props: DateTimeSettingProps) => <DateTimeSetting {...props}/>,
  time: (label: string) =>
    <Form.Item
      label={'test'}
      children={<TimeDropdown
        type={TimeDropdownTypes.Daily}
        name={name as string}
        label={label}
      />}
    />
}

export function getAvailableActions (status: string, label: string,
  settings: { date: string, hour: number }) {
  if  (status === 'new' || status === 'scheduled') {
    return scheduleActions.datetime({ scheduledDate: settings.date, scheduledTime: settings.hour })
  } else {
    return scheduleActions.time(label)
  }
}

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentAIFormDto>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)
  const scheduleSettings = form.getFieldValue('settings')
  const status = form.getFieldValue('status')

  const calendarText = defineMessage({ defaultMessage: `This recommendation will be
    applied at the chosen time whenever there is a need to change the channel plan.
    Schedule a time during off-hours when the number of WiFi clients is at the minimum.`
  })

  const sideNotes = {
    title: defineMessage({ defaultMessage: 'Side Notes' })
  }

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(steps.title.settings)} />
      <StepsForm.TextContent>
        <Typography.Paragraph>
          {$t(calendarText)}
        </Typography.Paragraph>
      </StepsForm.TextContent>
      {getAvailableActions(status,$t(defineMessage({ defaultMessage: 'Schedule Time' })),
        scheduleSettings )}

    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes $pageHeaderY={pageHeaderY}>
        <Typography.Title level={4}>
          {$t(sideNotes.title)}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t(crrmIntent[isOptimized(intentPriority) as IntentPriority]?.title)}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(crrmIntent[isOptimized(intentPriority) as IntentPriority]?.content)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
      </UI.SideNotes>
    </Col>
  </Row>
}

Settings.fieldName = name
Settings.label = label
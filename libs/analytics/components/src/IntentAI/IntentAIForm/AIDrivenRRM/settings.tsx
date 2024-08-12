import React, {  useRef } from 'react'

import { Row, Col, Typography, Form }        from 'antd'
import { DatePickerProps, RangePickerProps } from 'antd/lib/date-picker'
import { NamePath }                          from 'antd/lib/form/interface'
import dayjs                                 from 'dayjs'
import { Moment }                            from 'moment-timezone'
import { defineMessage, useIntl }            from 'react-intl'

import { DateTimeDropdown, StepsForm, TimeDropdown, useLayoutContext, useStepFormContext } from '@acx-ui/components'

import { IntentAIFormDto } from '../../types'
import * as UI             from '../styledComponents'

import { IntentPriority, Priority } from './priority'

import { steps, crrmIntent, isOptimized } from '.'

const name = 'settings' as NamePath
const label = defineMessage({ defaultMessage: 'Settings' })

function DateTimeSetting ({
  scheduledDate,
  scheduledTime
}: DateTimeSettingProps) {
  const initialTime = useRef(scheduledTime)
  const { form } = useStepFormContext<IntentAIFormDto>()
  const disabledDate : RangePickerProps['disabledDate']= (current) => {
    return current && current < dayjs().startOf('day')
  }
  const onChange: DatePickerProps['onChange'] = (date) => {
    form.setFieldValue(['settings', 'date'], date)
  }
  const { $t } = useIntl()
  return (
    <DateTimeDropdown
      name={name as string}
      dateLabel={$t(defineMessage({ defaultMessage: 'Schedule Date' }))}
      timeLabel={$t(defineMessage({ defaultMessage: 'Schedule Time' }))}
      initialDate={scheduledDate} // initial date from scheduledAt if  any
      time={initialTime}
      disabledDate={disabledDate} // disable all date before current
      onchange={onChange}
      form={form}
    />
  )}

type DateTimeSettingProps = {
  scheduledDate: Moment
  scheduledTime: number
}

const scheduleActions = {
  datetime: (props: DateTimeSettingProps) => <DateTimeSetting {...props}/>,
  time: () =>
    <Form.Item
      label={'Schedule Time'}
      children={
        <TimeDropdown name={name as string} spanLength={24} />
      }
    />
}

export function getAvailableActions (status: string,
  settings: { date: Moment, hour: number }) {
  if  (status === 'new' || status === 'scheduled') {
    return scheduleActions.datetime({ scheduledDate: settings.date, scheduledTime: settings.hour })
  } else {
    return scheduleActions.time()
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
      {getAvailableActions(status,scheduleSettings)}

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
import React, { MutableRefObject, useRef, useState } from 'react'

import { Row, Col, Typography, Form, DatePicker } from 'antd'
import { NamePath }                               from 'antd/lib/form/interface'
import moment, { Moment }                         from 'moment-timezone'
import { defineMessage, useIntl }                 from 'react-intl'

import { StepsForm, TimeDropdown, TimeDropdownTypes, useLayoutContext, useStepFormContext } from '@acx-ui/components'

import { IntentAIFormDto } from '../../types'
import * as UI             from '../styledComponents'

import { IntentPriority, Priority } from './priority'

import { steps, crrmIntent, isOptimized } from '.'

const name = 'settings' as NamePath
const label = defineMessage({ defaultMessage: 'Settings' })


// interface DateTimeDropdownProps {
//   // extraFooter?: ReactNode;
//   // disabled?: boolean;
//   // icon?: ReactNode;
//   initialDate: MutableRefObject<Moment>
//   // onApply: (value: Moment) => void;
//   // title?: string;
//   disabledDateTime?: {
//     disabledDate?: (value: Moment) => boolean,
//     disabledHours?: (value: Moment) => number[],
//     disabledMinutes?: (value: Moment) => number[],
//   }
// }

// export function DateTimeDropdown (
//   {
//     initialDate,
//     disabledDateTime
//   } : DateTimeDropdownProps) {
//   const { disabledDate, disabledHours, disabledMinutes } = disabledDateTime || {}
//   const [date, setDate] = useState(() => initialDate.current)
//   return (
//     <DatePicker
//       open={true}
//       // // className='hidden-date-input'
//       // // dropdownClassName='hidden-date-input-popover'
//       picker='date'
//       value={date}
//       // // disabled={disabled}
//       // // onClick={() => setOpen(true)}
//       showTime={false}
//       showToday={false}
//       // disabledDate={disabledDate}
//       renderExtraFooter={
//         () => 'yo'}
//     />
//   )}

type DateTimeSettingProps = {
  scheduledDate: string,
  // disabledDateTime?: {
  //       disabledDate?: (value: Moment) => boolean,
  //       disabledHours?: (value: Moment) => number[],
  //       disabledMinutes?: (value: Moment) => number[],
  //     }
}

function DateTimeSetting ({
  scheduledDate
  // disabledDateTime
}: DateTimeSettingProps) {
  const initialDate = useRef(moment(scheduledDate))
  // const { disabledDate, disabledHours, disabledMinutes } = disabledDateTime || {}
  const [date, setDate] = useState(() => initialDate.current)
  console.log(date)
  return (
    <Form.Item name={['settings', 'date']} valuePropName={'date'}>
      <DatePicker
        open={true}
        // // className='hidden-date-input'
        // // dropdownClassName='hidden-date-input-popover'
        picker='date'
        value={date}
        // // disabled={disabled}
        // // onClick={() => setOpen(true)}
        showTime={false}
        showToday={false}
        // disabledDate={disabledDate}
        onChange={value => setDate(value!)}
        renderExtraFooter={
          () => <TimeDropdown type={TimeDropdownTypes.Daily} name={name as string} />}
      />
    </Form.Item>
  )}
// return (<DateTimeDropdown initialDate={date} />)

const scheduleActions = {
  datetime: (props: DateTimeSettingProps) => <DateTimeSetting {...props}/>,
  time: () => <TimeDropdown type={TimeDropdownTypes.Daily} name={name as string} />
}

export function getAvailableActions (status: string,
  settings: { date: string, hour: string }) {
  if  (status === 'new' || status === 'applyscheduled') {
    // do datetimedropdown
  } else {
    // do timedropdown
  }
  console.log(settings)

  // return scheduleActions.time()2024-08-02
  // return scheduleActions.datetime({ scheduledDate: settings.date })
  return scheduleActions.datetime({ scheduledDate: '2024-08-15' })
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
      <Form.Item name={['scheduled', 'date']}>
        {getAvailableActions(status,scheduleSettings)}
      </Form.Item>

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
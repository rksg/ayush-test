import React, { MutableRefObject, useRef, useState } from 'react'

import { Row, Col, Typography, Form, DatePicker } from 'antd'
import { RangePickerProps }                       from 'antd/lib/date-picker'
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


// interface DateTimeDropdownProps {
//   initialDate: Moment
//   initialTime: number,
//   disabledDate:(value: Moment) => boolean
// }

// export const DateTimeDropdown = (
//   {
//     initialDate,
//     initialTime,
//     disabledDate
//   } : DateTimeDropdownProps) => {
//   const [date, setDate] = useState(initialDate)
//   console.log(date)
//   return (
//     <Form.Item name={['settings', 'date']}
//       // valuePropName={'date'}
//       // getValueProps={() => ({
//       //   value: { date },
//       //   onChange: (date: { format: (arg0: string) => any }) => {
//       //     console.log('Date selected:', date ? date.format('YYYY-MM-DD') : 'No date')
//       //   }
//       // })}
//       // defaultValue={initialDate}
//       getValueProps={(i) => ({ value: moment(i) })}
//     >
//       <DatePicker
//         open={true}
//         className='hidden-date-input'
//         dropdownClassName='hidden-date-input-popover'
//         picker='date'
//         // value={date}
//         showTime={false}
//         showToday={false}
//         disabledDate={disabledDate}
//         // onChange={(value) => {
//         //   console.log(value)
//         //   setDate(value!)
//         // }}

//         renderExtraFooter={
//           () => <TimeDropdown type={TimeDropdownTypes.Daily}
//             name={name as string}
//             disabledDateTime={
//               { disabledStrictlyBefore: initialTime }
//             }
//           />}
//       />
//     </Form.Item>
//   )
// }

function DateTimeSetting ({
  scheduledDate,
  scheduledTime
}: DateTimeSettingProps) {
  const { $t } = useIntl()
  const initialDate = moment(scheduledDate)
  // const [date, setDate] = useState(initialDate)
  const disabledDate : RangePickerProps['disabledDate']= (current) => {
    return current && current < dayjs().startOf('day')
  }
  return (
    <Form.Item name={['settings', 'date']}
      label={$t(label)}
      valuePropName={'date'}

      // getValueProps={() => ({
      //   value: { date },
      //   onChange: (value: moment.Moment) => {
      //     console.log(value)
      //     setDate(value!)
      //   }
      // })}


      // defaultValue={initialDate}
      // getValueProps={(i) => ({
      //   value: moment(i)
      //   // onChange: (value: moment.Moment) => {
      //   //   console.log(value)
      //   //   setDate(value!)
      //   // }
      // })}

    >
      <DatePicker
        open={true}
        className='hidden-date-input'
        dropdownClassName='hidden-date-input-popover'
        picker='date'
        // value={date}
        showTime={false}
        showToday={false}
        disabledDate={disabledDate}
        // onChange={(value) => {
        //   console.log(value)
        //   setDate(value!)
        // }}

        renderExtraFooter={
          () => <TimeDropdown type={TimeDropdownTypes.Daily}
            name={name as string}
            disabledDateTime={
              { disabledStrictlyBefore: scheduledTime + 0.25 }
            }
          />}
      />
    </Form.Item>
  )}

type DateTimeSettingProps = {
  scheduledDate: string
  scheduledTime: number
}

const scheduleActions = {
  datetime: (props: DateTimeSettingProps) => <DateTimeSetting {...props}/>,
  time: () => <TimeDropdown type={TimeDropdownTypes.Daily}
    name={name as string}/>
}

export function getAvailableActions (status: string,
  settings: { date: string, hour: number }) {
  console.log(status)
  if  (status === 'new' || status === 'scheduled') {
    console.log('hereee')
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
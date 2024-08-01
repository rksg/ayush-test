import React, { useRef } from 'react'

import { Row, Col, Typography, Form } from 'antd'
import { NamePath }                   from 'antd/lib/form/interface'
import moment                         from 'moment-timezone'
import { defineMessage, useIntl }     from 'react-intl'

import { DateTimeDropdown, StepsForm, TimeDropdown, TimeDropdownTypes, useLayoutContext, useStepFormContext } from '@acx-ui/components'

import { IntentAIFormDto } from '../../types'
import * as UI             from '../styledComponents'

import { IntentPriority, Priority } from './priority'

import { steps, crrmIntent, isOptimized } from '.'

const name = 'settings' as NamePath
const label = defineMessage({ defaultMessage: 'Settings' })


type DateTimeSettingProps = {
  scheduleAt:string
}

function DateTimeSetting ({
  scheduleAt
}: DateTimeSettingProps) {
  const initialScheduledAt = useRef(moment(scheduleAt))
  return (<DateTimeDropdown initialDate={initialScheduledAt} />)
}

const scheduleActions = {
  datetime: (props: DateTimeSettingProps) =>
    <Form.Item name={['scheduled', 'date']}><DateTimeSetting {...props}/></Form.Item>,
  time: () => <TimeDropdown type={TimeDropdownTypes.Daily} name='daily' />
}

export function getAvailableActions (scheduledTime: string) {
  console.log(scheduledTime)
  return scheduleActions.time()
}

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentAIFormDto>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)
  const scheduledTime = form.getFieldValue('scheduledTime')

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
        {getAvailableActions(scheduledTime)}
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
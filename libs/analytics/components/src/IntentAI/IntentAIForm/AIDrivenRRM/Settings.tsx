import React from 'react'

import { Row, Col, Typography }   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { StepsForm, useLayoutContext, useStepFormContext } from '@acx-ui/components'

import { EnhancedIntent } from '../services'
import * as UI            from '../styledComponents'

import { IntentPriority, Priority } from './Priority'

import { steps, crrmIntent, isOptimized } from '.'

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EnhancedIntent>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)

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

import React from 'react'

import { Row, Col, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { StepsForm, useLayoutContext, useStepFormContext } from '@acx-ui/components'

import { steps, crrmIntent, isOptimized } from '../config'
import { EnhancedRecommendation }         from '../services'
import * as UI                            from '../styledComponents'

import { IntentPriority, Priority } from './priority'

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EnhancedRecommendation>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(steps.title.settings)} />
      <StepsForm.TextContent>
        <Typography.Paragraph>
          {$t(steps.calendarText)}
        </Typography.Paragraph>
      </StepsForm.TextContent>
    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes $pageHeaderY={pageHeaderY}>
        <Typography.Title level={4}>
          {$t(steps.sideNotes.title)}
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

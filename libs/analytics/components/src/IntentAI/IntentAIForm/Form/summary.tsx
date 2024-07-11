import React from 'react'

import { Row, Col, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { StepsForm, useLayoutContext, useStepFormContext } from '@acx-ui/components'

import * as config                from '../config'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

import { IntentPriority, Priority } from './priority'

export function Summary () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EnhancedRecommendation>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(config.steps.title.summary)} />
    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes $pageHeaderY={pageHeaderY}>
        <Typography.Title level={4}>
          {$t(config.steps.sideNotes.title)}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t(config.crrmIntent[config.isOptimized(intentPriority) as IntentPriority]?.title)}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(config.crrmIntent[config.isOptimized(intentPriority) as IntentPriority]?.content)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
      </UI.SideNotes>
    </Col>
  </Row>
}

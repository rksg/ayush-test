import React from 'react'

import { Row, Col, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import * as config                from '../config'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

import { IntentType, Priority } from './priority'

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EnhancedRecommendation>()
  const intentType = form.getFieldValue(Priority.fieldName)

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(config.steps.title.settings)} />
      <Typography.Paragraph>
        {$t(config.steps.calendarText)}
      </Typography.Paragraph>
    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes>
        <Typography.Title level={4}>
          {$t(config.steps.sideNotes.title)}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t(config.steps[intentType as IntentType]?.title)}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(config.steps[intentType as IntentType]?.content)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
      </UI.SideNotes>
    </Col>

  </Row>
}

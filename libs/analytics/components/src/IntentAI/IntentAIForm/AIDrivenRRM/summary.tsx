import React from 'react'

import { Row, Col, Typography }   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { TrendTypeEnum }                                              from '@acx-ui/analytics/utils'
import { StepsForm, useLayoutContext, useStepFormContext, TrendPill } from '@acx-ui/components'

import { IntentAIRRMGraph }                  from '../../RRMGraph'
import { IntentAIFormDto }                   from '../../types'
import { dataRetentionText, isDataRetained } from '../../utils'
import { EnhancedIntent, getGraphKPIs }      from '../services'
import * as UI                               from '../styledComponents'

import { IntentPriority, Priority } from './priority'

import { steps, crrmIntent, isOptimized, kpis } from '.'

export function Summary () {
  const { $t } = useIntl()
  const { form, initialValues } = useStepFormContext<EnhancedIntent>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)
  const details = initialValues as EnhancedIntent

  const sideNotes = {
    title: defineMessage({ defaultMessage: 'Side Notes' })
  }

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t(steps.title.summary)} />
      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'Projected interfering links reduction' })}
      </StepsForm.Subtitle>
      { initialValues
          && isDataRetained(initialValues?.dataEndTime)
        ? <>
          <IntentAIRRMGraph
            details={initialValues as EnhancedIntent}
          />
          {getGraphKPIs(details, kpis).map(kpi => (
            <React.Fragment key={kpi.key}>
              <StepsForm.Subtitle children={$t(kpi.label)} />
              <StepsForm.Subtitle>
                <UI.Kpi>
                  <UI.KpiText>{kpi.after}</UI.KpiText>
                  <TrendPill
                    value={kpi.delta.value}
                    trend={kpi.delta.trend as TrendTypeEnum}
                  />
                </UI.Kpi>
              </StepsForm.Subtitle>
            </React.Fragment>
          ))}
          <StepsForm.Subtitle>
            {$t({ defaultMessage: 'Schedule' })}
          </StepsForm.Subtitle>
        </>
        : $t(dataRetentionText)
      }
    </Col>
    <Col span={7} offset={1}>
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

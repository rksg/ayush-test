import React from 'react'

import { Row, Col, Typography }   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { TrendTypeEnum }                                                                         from '@acx-ui/analytics/utils'
import { StepsForm, useLayoutContext, useStepFormContext, recommendationBandMapping, TrendPill } from '@acx-ui/components'

import { IntentAIRRMGraph, getGraphKPI }     from '../../RRMGraph'
import { useIntentAICRRMQuery }              from '../../RRMGraph/services'
import { dataRetentionText, isDataRetained } from '../../utils'
import { EnhancedIntent }                    from '../services'
import * as UI                               from '../styledComponents'

import { IntentPriority, Priority } from './priority'

import { steps, crrmIntent, isOptimized } from '.'

export function Summary () {
  const { $t } = useIntl()
  const { form, initialValues } = useStepFormContext<EnhancedIntent>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)

  const band = recommendationBandMapping[
    initialValues?.code as keyof typeof recommendationBandMapping]
  const queryResult = useIntentAICRRMQuery(initialValues as EnhancedIntent, band)
  const crrmData = queryResult?.data
  const { interferingLinks, linksPerAP } = getGraphKPI(
    initialValues as EnhancedIntent, crrmData)

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
          <StepsForm.Subtitle>
            {$t({ defaultMessage: 'Interfering links' })}
          </StepsForm.Subtitle>
          <StepsForm.Subtitle>
            <UI.Kpi>
              <UI.KpiText>{interferingLinks.after}</UI.KpiText>
              <TrendPill
                value={interferingLinks.links.value as string}
                trend={interferingLinks.links.trend as TrendTypeEnum}
              />
            </UI.Kpi>
          </StepsForm.Subtitle>
          <StepsForm.Subtitle>
            {$t({ defaultMessage: 'Average interfering links per AP' })}
          </StepsForm.Subtitle>
          <StepsForm.Subtitle>
            <UI.Kpi>
              <UI.KpiText>{Math.ceil(linksPerAP.after)}</UI.KpiText>
              <TrendPill
                value={linksPerAP.average.value as string}
                trend={linksPerAP.average.trend as TrendTypeEnum} />
            </UI.Kpi>
          </StepsForm.Subtitle>
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

import React from 'react'

import { Row, Col, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { TrendTypeEnum }                                                                                       from '@acx-ui/analytics/utils'
import { StepsForm, useLayoutContext, useStepFormContext, recommendationBandMapping, Descriptions, TrendPill } from '@acx-ui/components'

import { IntentAIRRMGraph, getGraphKPI }  from '../../RRMGraph'
import { useIntentAICRRMQuery }           from '../../RRMGraph/services'
import { steps, crrmIntent, isOptimized } from '../config'
import { EnhancedRecommendation }         from '../services'
import * as UI                            from '../styledComponents'
import { isDataRetained }                 from '../utils'

import { IntentPriority, Priority } from './priority'

export function Summary () {
  const { $t } = useIntl()
  const { form, initialValues } = useStepFormContext<EnhancedRecommendation>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)

  const band = recommendationBandMapping[
    initialValues?.code as keyof typeof recommendationBandMapping]
  const queryResult = useIntentAICRRMQuery(initialValues as EnhancedRecommendation, band)
  const crrmData = queryResult?.data

  const { interferingLinks, linksPerAP } = getGraphKPI(
    initialValues as EnhancedRecommendation, crrmData)

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(steps.title.summary)} />
      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'Projected interfering links reduction' })}
      </StepsForm.Subtitle>
      { initialValues
          && isDataRetained(initialValues?.dataEndTime)
          && <IntentAIRRMGraph
            details={initialValues as EnhancedRecommendation}
          />}
      <Descriptions noSpace>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Interfering links' })}
          children={<>
            {interferingLinks.after}
            <TrendPill
              value={interferingLinks.links.value as string}
              trend={interferingLinks.links.trend as TrendTypeEnum}
            />
          </>}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Average interfering links per AP' })}
          children={<>
            {Math.ceil(linksPerAP.after)}
            <TrendPill
              value={linksPerAP.average.value as string}
              trend={linksPerAP.average.trend as TrendTypeEnum} />
          </>}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Schedule' })}
          children={''}
        />
      </Descriptions>
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

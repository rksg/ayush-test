import React from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { TrendTypeEnum }                                 from '@acx-ui/analytics/utils'
import { useStepFormContext, recommendationBandMapping } from '@acx-ui/components'

import * as config                       from '../config'
import { IntentAIRRMGraph, getGraphKPI } from '../Graph'
import { useIntentAICRRMQuery }          from '../Graph/services'
import { EnhancedRecommendation }        from '../services'
import * as UI                           from '../styledComponents'
import { isDataRetained }                from '../utils'

import { IntentType, Priority } from './priority'

export function Summary () {
  const { $t } = useIntl()
  const title = $t(config.steps.title.summary)
  const { form, initialValues } = useStepFormContext<EnhancedRecommendation>()
  const intentType = form.getFieldValue(Priority.fieldName)
  const band = recommendationBandMapping[
    initialValues?.code as keyof typeof recommendationBandMapping]
  const queryResult = useIntentAICRRMQuery(initialValues as EnhancedRecommendation, band)
  const crrmData = queryResult?.data

  const { interferingLinks, linksPerAP } = getGraphKPI(
    initialValues as EnhancedRecommendation, crrmData)

  return <Row gutter={20}>
    <Col span={16}>
      <UI.Wrapper>
        <UI.Title>{title}</UI.Title>
        <UI.SummaryTitle>
          {$t({ defaultMessage: 'Projected interfering links reduction' })}
        </UI.SummaryTitle>
        { initialValues
          && isDataRetained(initialValues.dataEndTime)
          && <IntentAIRRMGraph
            details={initialValues as EnhancedRecommendation}
          />}
        <UI.SummaryTitle>
          {$t({ defaultMessage: 'Interfering links' })}
        </UI.SummaryTitle>
        <UI.ContentText>
          <UI.SummaryText>
            <UI.SummaryContent>{interferingLinks.after}</UI.SummaryContent>
            <UI.TrendPill
              value={interferingLinks.links.value as string}
              trend={interferingLinks.links.trend as TrendTypeEnum}
            />
          </UI.SummaryText>
        </UI.ContentText>
        <UI.SummaryTitle>
          {$t({ defaultMessage: 'Average interfering links per AP' })}
        </UI.SummaryTitle>
        <UI.ContentText>
          <UI.SummaryText>
            <UI.SummaryContent>{Math.ceil(linksPerAP.after)}</UI.SummaryContent>
            <UI.TrendPill
              value={linksPerAP.average.value as string}
              trend={linksPerAP.average.trend as TrendTypeEnum} />
          </UI.SummaryText>
        </UI.ContentText>
        <UI.SummaryTitle>
          {$t({ defaultMessage: 'Schedule' })}
        </UI.SummaryTitle>
      </UI.Wrapper>
    </Col>

    <Col span={7} offset={1}>
      <UI.Wrapper>
        <UI.SideNote>
          <UI.SideNoteHeader>
            <UI.SideNoteTitle>
              {$t(config.steps.sideNotes.title)}
            </UI.SideNoteTitle>
          </UI.SideNoteHeader>
          <UI.SideNoteSubtitle>
            {$t(config.steps[intentType as IntentType]?.title)}
          </UI.SideNoteSubtitle>
          <UI.SideNoteContent>
            {$t(config.steps[intentType as IntentType]?.content)}
          </UI.SideNoteContent>
        </UI.SideNote>
      </UI.Wrapper>
    </Col>
  </Row>
}

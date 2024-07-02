import React from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { kpiDelta, TrendTypeEnum }                                               from '@acx-ui/analytics/utils'
import { useStepFormContext, recommendationBandMapping, ProcessedCloudRRMGraph } from '@acx-ui/components'
import { formatter }                                                             from '@acx-ui/formatter'

import * as config                from '../config'
import { CloudRRMGraph }          from '../Graph'
import { useCRRMQuery }           from '../Graph/services'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'
import { isDataRetained }         from '../utils'

import { IntentType, Priority } from './priority'

export function Summary () {
  const { $t } = useIntl()
  const title = $t(config.steps.title.summary)
  const { form, initialValues } = useStepFormContext<EnhancedRecommendation>()
  const intentType = form.getFieldValue(Priority.fieldName)

  // kpi for interfering links
  const { before, after } = initialValues?.crrmInterferingLinks!
  const deltaSign = '-'
  const format = formatter('percentFormat')
  const links = kpiDelta(before, after, deltaSign, format)

  // kpi for average interfering links per AP
  const band = recommendationBandMapping[
    initialValues?.code as keyof typeof recommendationBandMapping]
  const queryResult = useCRRMQuery(initialValues as EnhancedRecommendation, band)
  const crrmData = queryResult?.data

  function calculateAverageLinks (data: ProcessedCloudRRMGraph[]) {
    const kpiBefore = data[0]
    const kpiAfter = data[1]

    const beforeLinks = kpiBefore?.interferingLinks || 0
    const afterLinks = kpiAfter?.interferingLinks || 0
    const beforeAPs = kpiBefore?.affectedAPs || 0
    const afterAPs = kpiAfter?.affectedAPs || 0

    const averageBefore = beforeAPs ? beforeLinks / beforeAPs : 0
    const averageAfter = afterAPs ? afterLinks / afterAPs : 0

    const averageLinks = kpiDelta(averageBefore, averageAfter, deltaSign, format)

    return {
      averageLinks, averageAfter
    }
  }
  const kpi = calculateAverageLinks(crrmData)

  return <Row gutter={20}>
    <Col span={16}>
      <UI.Wrapper>
        <UI.Title>{title}</UI.Title>
        <UI.GraphTitle>
          {$t({ defaultMessage: 'Projected interfering links reduction' })}
        </UI.GraphTitle>
        { initialValues
          && isDataRetained(initialValues.dataEndTime)
          && <CloudRRMGraph
            details={initialValues as EnhancedRecommendation}
          />}
        <UI.SummaryTitle>
          {$t({ defaultMessage: 'Interfering links' })}
        </UI.SummaryTitle>
        <UI.ContentText>
          <UI.SummaryText>
            <UI.SummaryContent>{after}</UI.SummaryContent>
            <UI.TrendPill value={links.value as string} trend={links.trend as TrendTypeEnum} />
          </UI.SummaryText>
        </UI.ContentText>
        <UI.SummaryTitle>
          {$t({ defaultMessage: 'Average interfering links per AP' })}
        </UI.SummaryTitle>
        <UI.ContentText>
          <UI.SummaryText>
            <UI.SummaryContent>{Math.ceil(kpi.averageAfter)}</UI.SummaryContent>
            <UI.TrendPill
              value={kpi.averageLinks.value as string}
              trend={kpi.averageLinks.trend as TrendTypeEnum} />
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

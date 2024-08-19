import React from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { TrendTypeEnum }                                from '@acx-ui/analytics/utils'
import { StepsForm, TrendPill, ProcessedCloudRRMGraph } from '@acx-ui/components'

import { getGraphKPIs }                      from '../../IntentAIForm/services'
import * as UI                               from '../../IntentAIForm/styledComponents'
import { useIntentContext }                  from '../../IntentContext'
import { dataRetentionText, isDataRetained } from '../../utils'
import { IntentAIRRMGraph }                  from '../RRMGraph'


import * as SideNotes from './SideNotes'

export function Summary (
  { summaryUrlBefore, summaryUrlAfter, crrmData } :
  { summaryUrlBefore?: string, summaryUrlAfter?: string, crrmData: ProcessedCloudRRMGraph[] }) {
  const { $t } = useIntl()
  const { intent, kpis } = useIntentContext()

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'Projected interfering links reduction' })}
      </StepsForm.Subtitle>
      {isDataRetained(intent.dataEndTime)
        ? <>
          <IntentAIRRMGraph
            details={intent}
            crrmData={crrmData}
            summaryUrlBefore={summaryUrlBefore}
            summaryUrlAfter={summaryUrlAfter}
          />
          {/* TODO: refactor: move Kpis into component like KpiCard */}
          {getGraphKPIs(intent, kpis).map(kpi => (
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
      <SideNotes.Summary />
    </Col>
  </Row>
}

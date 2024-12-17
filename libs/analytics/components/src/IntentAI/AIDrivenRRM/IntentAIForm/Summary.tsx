
import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'

import { Loader, StepsForm } from '@acx-ui/components'

import { KpiField }             from '../../common/KpiField'
import { ScheduleTiming }       from '../../common/ScheduleTiming'
import { useIntentContext }     from '../../IntentContext'
import { getGraphKPIs }         from '../../useIntentDetailsQuery'
import { IntentAIRRMGraph }     from '../RRMGraph'
import { useIntentAICRRMQuery } from '../RRMGraph/services'

import * as SideNotes from './SideNotes'

export function Summary (
  { summaryUrlBefore, summaryUrlAfter, queryResult } :
  {
    summaryUrlBefore?: string,
    summaryUrlAfter?: string,
    queryResult: ReturnType<typeof useIntentAICRRMQuery>
  }) {
  const { $t } = useIntl()
  const { intent, kpis } = useIntentContext()

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <Form.Item label={$t({ defaultMessage: 'Projected interfering links reduction' })}>
        <Loader states={[queryResult]}>
          <IntentAIRRMGraph
            crrmData={queryResult.data}
            summaryUrlBefore={summaryUrlBefore}
            summaryUrlAfter={summaryUrlAfter}
          />
        </Loader>
      </Form.Item>
      {getGraphKPIs(intent, kpis).map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
      <ScheduleTiming.FieldSummary />
    </Col>
    <Col span={7} offset={1}>
      <SideNotes.Summary />
    </Col>
  </Row>
}

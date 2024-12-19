
import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { KpiField }         from '../../common/KpiField'
import { ScheduleTiming }   from '../../common/ScheduleTiming'
import { useIntentContext } from '../../IntentContext'
import { getGraphKPIs }     from '../../useIntentDetailsQuery'
import { IntentAIRRMGraph } from '../RRMGraph'

import * as SideNotes from './SideNotes'

export function Summary () {
  const { $t } = useIntl()
  const { intent, kpis } = useIntentContext()

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <Form.Item label={$t({ defaultMessage: 'Projected interfering links reduction' })}>
        <IntentAIRRMGraph/>
      </Form.Item>
      {getGraphKPIs(intent, kpis).map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
      <ScheduleTiming.FieldSummary />
    </Col>
    <Col span={7} offset={1}>
      <SideNotes.Summary />
    </Col>
  </Row>
}

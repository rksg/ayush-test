import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { KPIFields }        from '../../common/KPIs'
import { ScheduleTiming }   from '../../common/ScheduleTiming'
import { IntentDetail }     from '../../useIntentDetailsQuery'
import { IntentAIRRMGraph } from '../RRMGraph'

import { Priority }   from './Priority'
import * as SideNotes from './SideNotes'

export function SummaryLegacy () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentDetail>()
  const isFullOptimization = form.getFieldValue(Priority.fieldName)

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <Form.Item label={$t({ defaultMessage: 'Projected interfering links reduction' })}>
        <IntentAIRRMGraph isFullOptimization={isFullOptimization} />
      </Form.Item>
      <KPIFields/>
      <ScheduleTiming.FieldSummary />
    </Col>
    <Col span={7} offset={1}>
      <SideNotes.Summary />
    </Col>
  </Row>
}

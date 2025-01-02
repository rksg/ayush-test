
import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm, ProcessedCloudRRMGraph } from '@acx-ui/components'

import { KPIFields }        from '../../common/KPIs'
import { ScheduleTiming }   from '../../common/ScheduleTiming'
import { IntentAIRRMGraph } from '../RRMGraph'

import * as SideNotes from './SideNotes'

export function Summary (
  { summaryUrlBefore, summaryUrlAfter, crrmData } :
  { summaryUrlBefore?: string, summaryUrlAfter?: string, crrmData: ProcessedCloudRRMGraph[] }) {
  const { $t } = useIntl()

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <Form.Item label={$t({ defaultMessage: 'Projected interfering links reduction' })}>
        <IntentAIRRMGraph
          crrmData={crrmData}
          summaryUrlBefore={summaryUrlBefore}
          summaryUrlAfter={summaryUrlAfter}
        />
      </Form.Item>
      <KPIFields/>
      <ScheduleTiming.FieldSummary />
    </Col>
    <Col span={7} offset={1}>
      <SideNotes.Summary />
    </Col>
  </Row>
}

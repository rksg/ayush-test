
import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { KPIFields }      from '../../common/KPIs'
import { ScheduleTiming } from '../../common/ScheduleTiming'
import { IntentDetail }   from '../../useIntentDetailsQuery'

import { priorities, Priority } from './Priority'
import * as SideNotes           from './SideNotes'

export function Summary () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentDetail>()
  const isFullOptimization = form.getFieldValue(Priority.fieldName)
  const priority = isFullOptimization ? priorities.full : priorities.partial

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <StepsForm.TextContent>
        <StepsForm.Subtitle children={$t({ defaultMessage: 'Selected Intent Priority' })} />
        <StepsForm.Subtitle children={priority.title} />
        <StepsForm.TextContent children={priority.content} />
      </StepsForm.TextContent>
      <KPIFields/>
      <ScheduleTiming.FieldSummary />
    </Col>
    <Col span={7} offset={1}>
      <SideNotes.Summary />
    </Col>
  </Row>
}

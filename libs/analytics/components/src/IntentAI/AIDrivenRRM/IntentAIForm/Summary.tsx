
import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm, Tooltip } from '@acx-ui/components'

import { KPIFields }      from '../../common/KPIs'
import { ScheduleTiming } from '../../common/ScheduleTiming'

import { priorities, Priority } from './Priority'
import * as SideNotes           from './SideNotes'

export function Summary () {
  const { $t } = useIntl()

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <Form.Item
        name={Priority.fieldName}
        label={$t({ defaultMessage: 'Selected Intent Priority' })}
      >
        <StepsForm.FieldSummary<boolean>
          convert={(isFullOptimization) => {
            const priority = isFullOptimization ? priorities.full : priorities.partial
            return <Tooltip title={priority.content} dottedUnderline={true}>
              {$t(priority.title)}
            </Tooltip>
          }}
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

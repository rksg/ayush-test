import React from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { KpiField }                          from '../../common/KpiField'
import { useIntentContext }                  from '../../IntentContext'
import { getGraphKPIs }           from '../../useIntentDetailsQuery'

import { ScheduleTiming } from '../../common/ScheduleTiming'
import _ from 'lodash'


export function Summary () {
  const { $t } = useIntl()
  const { intent, kpis } = useIntentContext()

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      {getGraphKPIs(intent, kpis).map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
      <ScheduleTiming.FieldSummary />
    </Col>
  </Row>
}

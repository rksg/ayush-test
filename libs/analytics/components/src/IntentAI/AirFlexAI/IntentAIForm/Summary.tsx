import React from 'react'

import { Row, Col, Form } from 'antd'
import { useIntl, defineMessage }  from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { KpiField }                          from '../../common/KpiField'
import { useIntentContext }                  from '../../IntentContext'
import { getGraphKPIs }           from '../../useIntentDetailsQuery'
import { ScheduleTiming } from '../../common/ScheduleTiming'
import _ from 'lodash'
import { Intent } from '../../useIntentDetailsQuery'
import type { Wlan } from './WlanSelection'

export function Summary () {
  const { $t } = useIntl()
  const { intent, kpis } = useIntentContext()
  const { form } = useStepFormContext<Intent>()
  const wlans = form.getFieldValue('wlans') as Wlan[]
  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      {getGraphKPIs(intent, kpis).map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
      <ScheduleTiming.FieldSummary />
      <Form.Item label={$t({ defaultMessage: 'Networks' })}>
      <u
        title={wlans.map(wlan => wlan.name).join(', ')}
        style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
          {$t({
            defaultMessage: `{count} {count, plural,
              one {{singular}}
              other {{plural}}
            } selected`
          }, {
            count: wlans.length,
            singular: $t(defineMessage({ defaultMessage: 'Network' })),
            plural: $t(defineMessage({ defaultMessage: 'Networks' }))
          })}
        </u>
      </Form.Item>
    </Col>
  </Row>
}

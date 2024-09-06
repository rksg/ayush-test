/* eslint-disable max-len */
import React from 'react'

import { Row, Col, Form }                           from 'antd'
import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { KpiField }             from '../../common/KpiField'
import { richTextFormatValues } from '../../common/richTextFormatValues'
import { ScheduleTiming }       from '../../common/ScheduleTiming'
import { useIntentContext }     from '../../IntentContext'
import { getGraphKPIs }         from '../../useIntentDetailsQuery'
import { Intent }               from '../../useIntentDetailsQuery'

import type { Wlan } from './WlanSelection'


export function Summary () {
  const { $t } = useIntl()
  const { intent, kpis } = useIntentContext()
  const { form } = useStepFormContext<Intent>()
  const wlans = form.getFieldValue('wlans') as Wlan[]
  const isEnabled = form.getFieldValue('preferences').enable
  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />

      {isEnabled
        ? <> {getGraphKPIs(intent, kpis).map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
          <ScheduleTiming.FieldSummary />
          <Form.Item name='networks'
            label={$t({ defaultMessage: 'Networks' })}
            rules={[{
              validator: () => {
                if (!wlans || wlans.length === 0) {
                  return Promise.reject($t({ defaultMessage: 'Please select atleast one Network in Settings' }))
                }
                return Promise.resolve()
              }
            }]}
          >
            <u
              title={wlans?.map(wlan => wlan.name).join(', ')}
              style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
              {$t({
                defaultMessage: `{count} {count, plural,
                    one {{singular}}
                    other {{plural}}
                  } selected`
              }, {
                count: wlans?.length || 0,
                singular: $t(defineMessage({ defaultMessage: 'Network' })),
                plural: $t(defineMessage({ defaultMessage: 'Networks' }))
              })}
            </u>
          </Form.Item>
        </>
        : <FormattedMessage
          values={richTextFormatValues}
          defaultMessage={`
              <p>IntentAI will maintain the existing network configuration and will cease automated monitoring of configuration for handling probe request/response in the network.</p>
              <p>For manual control, you may directly change the network configurations.</p>
              <p>For automated monitoring and control, you can select the "Resume" action, after which IntentAI will resume overseeing the network for this Intent.</p>
          `} />
      }
    </Col>
  </Row>
}

/* eslint-disable max-len */
import React from 'react'

import { Row, Col, Form }            from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'

import { KPIFields }            from '../../common/KPIs'
import { richTextFormatValues } from '../../common/richTextFormatValues'
import { ScheduleTiming }       from '../../common/ScheduleTiming'
import { IntentDetail }         from '../../useIntentDetailsQuery'

import type { Wlan } from './WlanSelection'


export function Summary () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentDetail>()
  const wlans = form.getFieldValue('wlans') as Wlan[]
  const isEnabled = form.getFieldValue('preferences').enable
  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />

      {isEnabled
        ? <> <KPIFields/>
          <ScheduleTiming.FieldSummary />
          <Form.Item name='networks'
            label={$t({ defaultMessage: 'Networks' })}
            rules={[{
              validator: () => {
                if (!wlans || wlans.length === 0) {
                  return Promise.reject($t({ defaultMessage: 'Please select at least one network in Settings' }))
                }
                return Promise.resolve()
              }
            }]}
          >
            <Tooltip
              placement='top'
              title={wlans?.map(wlan => wlan.name).join(', ')}
              dottedUnderline={true}
            >
              {$t({
                defaultMessage: `{count} {count, plural,
                    one {network}
                    other {networks}
                  } selected`
              }, {
                count: wlans?.length || 0
              })}
            </Tooltip>
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

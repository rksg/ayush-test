/* eslint-disable max-len */
import React from 'react'

import { Row, Col, Typography, Form } from 'antd'
import { NamePath }                   from 'antd/lib/form/interface'
import { useIntl, defineMessage }     from 'react-intl'

import { StepsForm, useLayoutContext, useStepFormContext } from '@acx-ui/components'
import { get }                                             from '@acx-ui/config'

import { TradeOff }               from '../../../TradeOff'
import { steps }                  from '../config'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

const name = ['preferences', 'crrmFullOptimization'] as NamePath
const label = defineMessage({ defaultMessage: 'Intent Priority' })

export enum IntentPriority {
  full = 'full',
  partial = 'partial'
}

export function Priority () {
  const { $t } = useIntl()
  const { initialValues } = useStepFormContext<EnhancedRecommendation>()
  const { pageHeaderY } = useLayoutContext()
  const { sliceValue } = initialValues!
  const priority = [
    {
      key: 'full',
      value: true,
      children: $t({ defaultMessage: 'High number of clients in a dense network (Default)' }),
      columns: [
        $t({ defaultMessage: 'High number of clients in a dense network (Default)' }),
        $t({ defaultMessage: 'This is AI-Driven RRM Full Optimization mode, where IntentAI will consider only the channels configured on the Controller, assess the neighbor AP radio channels for each AP radio and build a channel plan for each radio to minimize the interference. While building the channel plan, IntentAI may optionally change the AP Radio Channel Width and Transmit Power to minimize the channel interference.' })
      ]
    },
    {
      key: 'partial',
      value: false,
      children: $t({ defaultMessage: 'High client throughput in sparse network' }),
      columns: [
        $t({ defaultMessage: 'High client throughput in sparse network' }),
        $t({ defaultMessage: 'This is AI-Driven RRM Partial Optimization mode, where IntentAI will consider only the channels configured on the Controller, assess the neighbor AP channels for each AP radio and build a channel plan for each AP radio to minimize interference. While building the channel plan, IntentAI will NOT change the AP Radio Channel Width and Transmit Power.' })
      ]
    }
  ]

  const choose = get('IS_MLISA_SA')
    ? defineMessage({ defaultMessage: 'What is your primary network intent for Zone: {zone}' })
    : defineMessage({ defaultMessage: 'What is your primary network intent for Venue: {zone}' })

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(steps.title.priority)} />
      <StepsForm.Subtitle>
        {$t(choose, { zone: sliceValue })}
      </StepsForm.Subtitle>
      <Form.Item name={['preferences', 'crrmFullOptimization']}>
        <TradeOff
          radios={priority}
          headers={[
            $t({ defaultMessage: 'Intent Priority' }),
            $t({ defaultMessage: 'IntentAI Scope' })
          ]} />
      </Form.Item>
    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes $pageHeaderY={pageHeaderY}>
        <Typography.Title level={4}>
          {$t(steps.sideNotes.title)}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Potential trade-off?' })}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(steps.sideNotes.tradeoff)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
      </UI.SideNotes>
    </Col>
  </Row>
}

Priority.fieldName = name
Priority.label = label

/* eslint-disable max-len */
import React, { useState } from 'react'

import { Row, Col, Typography }   from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { StepsForm, useLayoutContext, useStepFormContext } from '@acx-ui/components'
import { get }                                             from '@acx-ui/config'

import { TradeOff }               from '../../../TradeOff'
import * as config                from '../config'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

const name = 'intentPriority' as const
const label = defineMessage({ defaultMessage: 'Intent Priority' })

export enum IntentPriority {
  full = 'full',
  partial = 'partial'
}

export function Priority () {
  const { $t } = useIntl()
  const { initialValues } = useStepFormContext<EnhancedRecommendation>()
  const { pageHeaderY } = useLayoutContext()
  const { sliceValue, preferences } = initialValues!
  const optimized = preferences?.crrmFullOptimization ? 'full' : 'partial'
  const [ currentPriority, setPriority ] = useState(optimized)
  const priority = [
    {
      key: 'full',
      value: 'full',
      children: $t({ defaultMessage: 'High number of clients in a dense network (Default)' }),
      columns: [
        $t({ defaultMessage: 'Maximize client density - simultaneous connected clients (Default)' }),
        $t({ defaultMessage: 'This is AI-Driven RRM Full Optimization mode, where IntentAI will consider only the channels configured on the Controller, assess the neighbor AP radio channels for each AP radio and build a channel plan for each radio to minimize the interference. While building the channel plan, IntentAI may optionally change the AP Radio Channel Width and Transmit Power to minimize the channel interference.' })
      ]
    },
    {
      key: 'partial',
      value: 'partial',
      children: 'High client throughput in sparse network',
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
      <StepsForm.Title children={$t(config.steps.title.priority)} />
      <StepsForm.Subtitle>
        {$t(choose, { zone: sliceValue })}
      </StepsForm.Subtitle>
      <TradeOff
        key='intentPriority'
        name='intentPriority'
        headers={[
          $t({ defaultMessage: 'Intent Priority' }),
          $t({ defaultMessage: 'IntentAI Scope' })
        ]}
        radios={priority}
        currentValue={currentPriority}
        onChange={(selected) => {
          setPriority(selected as string)
        }}
      />
    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes $pageHeaderY={pageHeaderY}>
        <Typography.Title level={4}>
          {$t({ defaultMessage: 'Side Notes' })}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Potential trade-off?' })}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(config.steps.sideNotes.tradeoff)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
      </UI.SideNotes>
    </Col>
  </Row>
}

Priority.fieldName = name
Priority.label = label

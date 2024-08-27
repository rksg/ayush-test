/* eslint-disable max-len */

import { Row, Col, Form }         from 'antd'
import { NamePath }               from 'antd/lib/form/interface'
import { useIntl, defineMessage } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { TradeOff }         from '../../../TradeOff'
import { useIntentContext } from '../../IntentContext'

import * as SideNotes from './SideNotes'

const name = ['preferences', 'crrmFullOptimization'] as NamePath
const label = defineMessage({ defaultMessage: 'Intent Priority' })

export enum IntentPriority {
  full = 'full',
  partial = 'partial'
}

export function Priority () {
  const { $t } = useIntl()
  const { intent: { sliceValue } } = useIntentContext()
  const priority = [
    {
      key: 'full',
      value: true,
      children: $t({ defaultMessage: 'High number of clients in a dense network (Default)' }),
      columns: [
        $t({ defaultMessage: 'High number of clients in a dense network (Default)' }),
        // TODO: i18n: Controller for R1?
        $t({ defaultMessage: 'This is AI-Driven RRM Full Optimization mode, where IntentAI will consider only the channels configured on the Controller, assess the neighbor AP radio channels for each AP radio and build a channel plan for each radio to minimize the interference. While building the channel plan, IntentAI may optionally change the AP Radio Channel Width and Transmit Power to minimize the channel interference.' })
      ]
    },
    {
      key: 'partial',
      value: false,
      children: $t({ defaultMessage: 'High client throughput in sparse network' }),
      columns: [
        $t({ defaultMessage: 'High client throughput in sparse network' }),
        // TODO: i18n: Controller for R1?
        $t({ defaultMessage: 'This is AI-Driven RRM Partial Optimization mode, where IntentAI will consider only the channels configured on the Controller, assess the neighbor AP channels for each AP radio and build a channel plan for each AP radio to minimize interference. While building the channel plan, IntentAI will NOT change the AP Radio Channel Width and Transmit Power.' })
      ]
    }
  ]

  const label = $t({ defaultMessage: 'What is your primary network intent for <VenueSingular></VenueSingular>: {zone}' }, { zone: sliceValue })

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Intent Priority' })} />
      <StepsForm.Subtitle children={label} />
      <Form.Item name={name}>
        <TradeOff
          radios={priority}
          headers={[
            $t({ defaultMessage: 'Intent Priority' }),
            $t({ defaultMessage: 'IntentAI Scope' })
          ]} />
      </Form.Item>
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Priority />
    </Col>
  </Row>
}

Priority.fieldName = name
Priority.label = label

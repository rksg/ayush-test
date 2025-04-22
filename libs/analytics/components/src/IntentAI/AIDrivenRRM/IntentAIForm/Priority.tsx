/* eslint-disable max-len */
import { Row, Col, Form }                           from 'antd'
import { NamePath }                                 from 'antd/lib/form/interface'
import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { IntentTradeOff }       from '../../common/IntentTradeOff'
import { richTextFormatValues } from '../../common/richTextFormatValues'
import { useIntentContext }     from '../../IntentContext'

import * as SideNotes from './SideNotes'

const name = ['preferences', 'crrmFullOptimization'] as NamePath
const label = defineMessage({ defaultMessage: 'Intent Priority' })

export const priorities = {
  full: {
    value: true,
    title: defineMessage({ defaultMessage: 'High number of clients in a dense network' }),
    content: <FormattedMessage
      values={richTextFormatValues}
      defaultMessage={`
        <p>Leverage <b><i>AI-Driven RRM Full Optimization</i></b> mode to assess the neighbor AP radio channels for each AP radio and build a channel plan for each radio to minimize the interference.</p>
        <p>In this mode, while building the channel plan, IntentAI may optionally change the <i>AP Radio Channel Width</i> and <i>Transmit Power</i> to minimize the channel interference.</p>
        <p>IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.</p>
      `}
    />
  },
  partial: {
    value: false,
    title: defineMessage({ defaultMessage: 'High client throughput in sparse network' }),
    content: <FormattedMessage
      values={richTextFormatValues}
      defaultMessage={`
        <p>Leverage <b><i>AI-Driven RRM Partial Optimization</i></b> mode to assess the neighbor AP channels for each AP radio and build a channel plan for each AP radio to minimize interference.</p>
        <p>In this mode, while building the channel plan, IntentAI <b>will NOT</b> change the <i>AP Radio Channel Width</i> and <i>Transmit Power</i>.</p>
        <p>IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.</p>
      `}
    />
  }
}


export function Priority () {
  const { $t } = useIntl()
  const { intent: { sliceValue } } = useIntentContext()
  const radios = Object.entries(priorities)
    .map(([key, priority]) => ({
      key,
      value: priority.value,
      children: $t(priority.title),
      columns: [priority.content]
    }))

  const label = $t({ defaultMessage: 'What is your primary network intent for <VenueSingular></VenueSingular>: {zone}' }, { zone: sliceValue })

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.TextContent>
        <StepsForm.Title children={$t({ defaultMessage: 'Intent Priority' })} />
        <StepsForm.Subtitle children={label} />
        <Form.Item
          name={name}
          rules={[{ required: true, message: $t({ defaultMessage: 'Please select intent priority' }) }]}
          children={<IntentTradeOff radios={radios} />}
        />
      </StepsForm.TextContent>
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Priority />
    </Col>
  </Row>
}

Priority.fieldName = name
Priority.label = label

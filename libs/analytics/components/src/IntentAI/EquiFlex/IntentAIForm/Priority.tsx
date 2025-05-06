/* eslint-disable max-len */

import { Row, Col, Form }                           from 'antd'
import { NamePath }                                 from 'antd/lib/form/interface'
import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { TradeOff }             from '../../../TradeOff'
import { richTextFormatValues } from '../../common/richTextFormatValues'
import { useIntentContext }     from '../../IntentContext'

import * as SideNotes from './SideNotes'

const name = ['preferences', 'enable'] as NamePath
const label = defineMessage({ defaultMessage: 'Intent Priority' })

export function Priority () {
  const { $t } = useIntl()
  const { intent: { sliceValue } } = useIntentContext()
  const priority = [
    {
      key: 'yes',
      value: true,
      children: $t({ defaultMessage: 'Reduce Management traffic in dense network' }),
      columns: [
        $t({ defaultMessage: 'Reduce Management traffic in dense network' }),
        <FormattedMessage {...defineMessage({ defaultMessage: `
          <p>Leverage <b><i>EquiFlex</i></b>, available only through IntentAI for intelligent handling of probe request/response and optimize management traffic in a dense network.</p>
          <p>For improved performance, this option will disable the Air Time Decongestion (ATD) feature if previously enabled for this network.</p>
        ` })}
        values={richTextFormatValues} />
      ]
    },
    {
      key: 'no',
      value: false,
      children: $t({ defaultMessage: 'Standard Management traffic in a sparse network' }),
      columns: [
        $t({ defaultMessage: 'Standard Management traffic in a sparse network' }),
        <FormattedMessage {...defineMessage({ defaultMessage: `
          <p>This option will disable <b><i>EquiFlex</i></b> feature and the network shall continue using current configuration if any for handling probe request/response in the network.</p>
          <p>For manual control, you may directly change the network configurations.</p>
        ` })}
        values={richTextFormatValues} />
      ]
    }
  ]

  const label = $t({
    defaultMessage: 'What is your primary network intent for <VenueSingular></VenueSingular> “{zone}” ?'
  },
  { zone: sliceValue }
  )

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Intent Priority' })} />
      <StepsForm.Subtitle children={label} />
      <Form.Item
        name={name}
        rules={[{ required: true, message: $t({ defaultMessage: 'Please select intent priority' }) }]}
        children={<TradeOff
          radios={priority}
          headers={[
            $t({ defaultMessage: 'Intent Priority' }),
            $t({ defaultMessage: 'IntentAI Scope' })
          ]}
        />}
      />
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Priority />
    </Col>
  </Row>
}

Priority.fieldName = name
Priority.label = label

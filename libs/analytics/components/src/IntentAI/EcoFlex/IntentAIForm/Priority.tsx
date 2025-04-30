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

export const usePriorityItems = () => {
  const { $t } = useIntl()
  return [
    {
      key: 'yes',
      value: true,
      children: $t({ defaultMessage: 'Reduction in energy footprint' }),
      columns: [
        $t({ defaultMessage: 'Reduction in energy footprint' }),
        <FormattedMessage {...defineMessage({ defaultMessage: `
          Leverage <b><i>Energy Saving</i></b>, available only through IntentAI for AI/ML based Energy Saving Model for the network. 
          In this mode, based on the usage pattern PowerSave supported APs are switched to PowerSaving mode and resumed to normal power based on the increased network activity.
          ` })}
        values={richTextFormatValues}
        />
      ]
    },
    {
      key: 'no',
      value: false,
      children: $t({ defaultMessage: 'Operation of the mission critical network' }),
      columns: [
        $t({ defaultMessage: 'Operation of the mission critical network' }),
        $t({ defaultMessage: 'This option will let all the APs work in normal power mode' })
      ]
    }
  ]
}

export function Priority () {
  const { $t } = useIntl()
  const { intent: { sliceValue } } = useIntentContext()
  const priority = usePriorityItems()

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

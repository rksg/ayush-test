/* eslint-disable max-len */

import { Row, Col, Form }         from 'antd'
import { NamePath }               from 'antd/lib/form/interface'
import { useIntl, defineMessage } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { TradeOff }           from '../../../TradeOff'
import { isStandaloneSwitch } from '../../common/isStandaloneSwitch'
import { useIntentContext }   from '../../IntentContext'

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
      children: $t({ defaultMessage: 'Reduce Management traffic in dense network' }),
      columns: [
        $t({ defaultMessage: 'Reduce Management traffic in dense network' }),
        $t({ defaultMessage: `Leverage AirFlexAI, available only through IntentAI for intelligent handling of probe request/response and optimize management traffic in a dense network.
        For improved performance, this option will disable the Air Time Decongestion (ATD) feature if previously enabled for this network.` })
      ]
    },
    {
      key: 'partial',
      value: false,
      children: $t({ defaultMessage: 'Standard Management traffic in a sparse network' }),
      columns: [
        $t({ defaultMessage: 'Standard Management traffic in a sparse network' }),
        $t({ defaultMessage: `This option will disable AirFlexAI feature and the network shall continue using current configuration if any for handling probe request/response in the network.
        For manual control, you may directly change the network configurations.` })
      ]
    }
  ]

  const label = isStandaloneSwitch(
    $t({ defaultMessage: 'What is your primary network intent for Zone: {zone}' }, { zone: sliceValue }),
    $t({ defaultMessage: 'What is your primary network intent for <VenueSingular></VenueSingular>: {zone}' }, { zone: sliceValue }))

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

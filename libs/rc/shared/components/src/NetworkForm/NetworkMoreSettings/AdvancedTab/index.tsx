import { useContext } from 'react'

import { Form, Slider } from 'antd'
import { useIntl }      from 'react-intl'

import { Tooltip }                    from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

import NetworkFormContext from '../../NetworkFormContext'
import * as UI            from '../styledComponents'

import QoS from './QoS'


export function AdvancedTab () {
  const { data } = useContext(NetworkFormContext)
  const { $t } = useIntl()

  const dtimTooltipContent =
   'Defines the frequency beacons will include a DTIM to wake clients in power-saving mode.'
  const labelWidth = '250px'

  return (
    <>
      <UI.FieldLabel width={labelWidth}>
        <Form.Item
          name={['wlan','advancedCustomization','dtimInterval']}
          initialValue={1}
          label={
            <>
              {$t({ defaultMessage: 'DTIM (Delivery Traffic Indication Message) Interval' })}
              <Tooltip
                title={$t({ defaultMessage: dtimTooltipContent })}
                placement='bottom'>
                <QuestionMarkCircleOutlined/>
              </Tooltip>
            </>
          }
          style={{ marginBottom: '15px', width: '300px' }}
          children={<Slider
            tooltipVisible={false}
            style={{ width: '240px' }}
            min={1}
            max={255}
            marks={{ 1: 'Lower latency', 255: 'Longer client battery life' }}
          />}
        />
      </UI.FieldLabel>

      <QoS wlanData={data} />
    </>
  )
}

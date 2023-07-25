import React from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import * as UI from '../../../../NetworkMoreSettings/styledComponents'

import { RadioBandsOfMlo } from './RadioBandsOfMlo'


interface MloComponentProps {
    initialValue: boolean
    checked: boolean
    enableWifi7: boolean
    enableMlo: boolean
    onEnableMLOChange: (checked: boolean) => void
}

export const MloComponent = (
  { initialValue,
    checked,
    enableWifi7,
    enableMlo,
    onEnableMLOChange
  }: MloComponentProps
) => {
  const { $t } = useIntl()

  return (
    <div data-testid={'EnableMLO'}>
      <UI.FieldLabel width='250px'>
        <div>
          {$t({ defaultMessage: 'Enable Multi-Link operation (MLO)' })}
          <Tooltip.Question
            title={`This feature allows a Wi-Fi 7 device to
            utilize multiple radio channels concurrently,
            for better throughput and increased network efficiency.
            Most relevant in high-density environments.
            The radios for MLO need to be active on APs`}
            placement='right'
            style={{ height: 10, marginLeft: -5, marginBottom: -3 }}
          />
        </div>
        <Form.Item
          name={['wlan', 'advancedCustomization', 'multiLinkOperationEnabled']}
          initialValue={initialValue}
          valuePropName='checked'
          style={{ marginBottom: '15px', width: '300px' }}
          children={
            <Switch
              disabled={!enableWifi7}
              onChange={onEnableMLOChange}
              checked={checked}
            />
          }
        />
      </UI.FieldLabel>
      { enableMlo && <RadioBandsOfMlo /> }
    </div>
  )
}
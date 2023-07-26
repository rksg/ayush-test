import React from 'react'

import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import * as UI from '../../../../NetworkMoreSettings/styledComponents'

import RadioBandsOfMlo from './RadioBandsOfMlo'


interface MloComponentProps {
    initialValue: boolean
    checked: boolean
    isDisableMlo: boolean
    onEnableMloChange: (checked: boolean) => void
}

const MloComponent = (
  { initialValue,
    checked,
    isDisableMlo,
    onEnableMloChange
  }: MloComponentProps
) => {
  const { $t } = useIntl()


  return (
    <div>
      <UI.FieldLabel width='250px'>
        <Space>
          {$t({ defaultMessage: 'Enable Multi-Link operation (MLO)' })}
          <Tooltip.Question
            title={$t({ defaultMessage: `This feature allows a Wi-Fi 7 device to
            utilize multiple radio channels concurrently,
            for better throughput and increased network efficiency.
            Most relevant in high-density environments.
            The radios for MLO need to be active on APs` })}
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          name={['wlan', 'advancedCustomization', 'multiLinkOperationEnabled']}
          valuePropName='checked'
          style={{ marginBottom: '15px', width: '300px' }}
          children={
            <Switch
              defaultChecked={initialValue}
              disabled={isDisableMlo}
              onChange={onEnableMloChange}
              checked={checked}
            />
          }
        />
      </UI.FieldLabel>
      { checked && <RadioBandsOfMlo /> }
    </div>
  )
}


export default MloComponent
import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import * as UI from '../../../../NetworkMoreSettings/styledComponents'

interface Wifi6And7ComponentProps {
    initialValue: boolean
    checked: boolean
    enableWifi7: boolean
    onEnableWiFiChange: (checked: boolean) => void
}

export const Wifi6And7Component = (
  { initialValue,
    checked,
    enableWifi7,
    onEnableWiFiChange
  }: Wifi6And7ComponentProps) => {
  const { $t } = useIntl()

  return (
    <div data-testid='EnableWiFi'>
      <UI.FieldLabel width='250px'>
        <Space>
          {$t({ defaultMessage: 'Enable WiFi 6/ 7' })}
          <Tooltip.Question
            title={$t({ defaultMessage: `Use this feature to allow some legacy Wi-Fi 5 clients
                    with out-of-date drivers to inter-operate with a Wi-Fi 6/7 AP.` })}
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          name={['wlan', 'advancedCustomization', 'enableWifi7']}
          style={{ marginBottom: '10px', width: '300px' }}
          valuePropName='checked'
          initialValue={initialValue}
          children={
            <Switch onChange={onEnableWiFiChange} checked={checked} />
          }
        />
      </UI.FieldLabel>
      {!enableWifi7 && (
        <div
          data-testid='Description'
          style={{ marginBottom: '10px', width: '300px', display: 'flex' }}
        >
          <UI.ExclamationCircleFilledIcon />
          <UI.Description>
            {/* eslint-disable-next-line max-len */}
            {`Clients connecting to this WLAN will not be able to use Wi-Fi 6/7 features,
                    such as 6GHz operation, 320MHz bandwidth and MLO.`}
          </UI.Description>
        </div>
      )}
    </div>
  )
}

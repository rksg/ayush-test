import React from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import * as UI from '../../../../../NetworkMoreSettings/styledComponents'

interface Props {
    enableVxLan: boolean;
}

export default function ProxyArp ({ enableVxLan }: Props) {
  const { $t } = useIntl()

  return (
    <UI.FieldLabel width='250px'>
      {$t({ defaultMessage: 'Proxy ARP:' })}
      <Form.Item
        data-testid='ProxyArp'
        name={['wlan', 'advancedCustomization', 'proxyARP']}
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={
          <Switch
            data-testid='ProxyArp-Switch'
            disabled={enableVxLan}
          />
        }
      />
    </UI.FieldLabel>
  )
}
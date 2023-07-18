import React from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import * as UI from '../../../../../NetworkMoreSettings/styledComponents'


interface Props {
    disabledOfSwitch: boolean
}


function ProxyArp ({ disabledOfSwitch }: Props) {
  const { $t } = useIntl()

  return (
    <UI.FieldLabel width='250px'>
      {$t({ defaultMessage: 'Proxy ARP' })}
      <Form.Item
        data-testid={'ProxyArp'}
        name={['wlan', 'advancedCustomization', 'proxyARP']}
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={
          <Switch
            data-testid={'ProxyArp-Switch'}
            disabled={disabledOfSwitch}
          />
        }
      />
    </UI.FieldLabel>
  )
}

export default ProxyArp

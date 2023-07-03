import { useContext } from 'react'

import { Form, Select, Switch } from 'antd'
import { useIntl }              from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import NetworkFormContext        from '../../NetworkFormContext'
import { hasVxLanTunnelProfile } from '../../utils'
import * as UI                   from '../styledComponents'

import ClientIsolationAllowListEditor from './ClientIsolationAllowListEditor'

const { useWatch } = Form
const { Option } = Select

enum IsolatePacketsTypeEnum {
  UNICAST = 'UNICAST',
  MULTICAST = 'MULTICAST',
  UNICAST_MULTICAST = 'UNICAST_MULTICAST',
}

export default function ClientIsolationForm () {
  const isPoliciesEnabled = useIsSplitOn(Features.POLICIES)
  const { data } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const clientIsolationEnabled = useWatch<boolean>(['wlan','advancedCustomization','clientIsolation'])
  // eslint-disable-next-line max-len
  const clientIsolationAllowlistEnabled = useWatch<boolean>(['wlan','advancedCustomization', 'clientIsolationAllowlistEnabled'])
  // eslint-disable-next-line max-len
  const clientIsolationAllowlistEnabledInitValue = data?.venues?.some(v => v.clientIsolationAllowlistId)
  const enableVxLan = hasVxLanTunnelProfile(data)

  return (<>
    <UI.FieldLabel width='125px'>
      {$t({ defaultMessage: 'Client Isolation:' })}

      <Form.Item
        name={['wlan','advancedCustomization','clientIsolation']}
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch disabled={enableVxLan}/>}
      />
    </UI.FieldLabel>

    {clientIsolationEnabled &&
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Isolate Packets:' })}
        name={['wlan','advancedCustomization','clientIsolationOptions', 'packetsType']}
        initialValue={IsolatePacketsTypeEnum.UNICAST}
      >
        <Select
          style={{ width: '240px' }}>
          <Option value={IsolatePacketsTypeEnum.UNICAST}>
            {$t({ defaultMessage: 'Unicast' })}
          </Option>
          <Option value={IsolatePacketsTypeEnum.MULTICAST}>
            {$t({ defaultMessage: 'Multicast/broadcast' })}
          </Option>
          <Option value={IsolatePacketsTypeEnum.UNICAST_MULTICAST}>
            {$t({ defaultMessage: 'Unicast and multicast/broadcast' })}
          </Option>
        </Select>
      </Form.Item>
      <UI.FieldLabel width='230px'>
        {$t({ defaultMessage: 'Automatic support for VRRP/HSRP:' })}
        <Form.Item
          name={['wlan','advancedCustomization','clientIsolationOptions', 'autoVrrp']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />} />
      </UI.FieldLabel>
      {isPoliciesEnabled ? <UI.FieldLabel width='230px'>
        {$t({ defaultMessage: 'Client Isolation Allowlist by Venue:' })}
        <Form.Item
          name={['wlan','advancedCustomization', 'clientIsolationAllowlistEnabled']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={clientIsolationAllowlistEnabledInitValue}
          children={<Switch />} />
      </UI.FieldLabel> : null}
      {clientIsolationAllowlistEnabled && isPoliciesEnabled &&
        <ClientIsolationAllowListEditor networkVenues={data?.venues}/>
      }
    </>
    }
  </>
  )
}

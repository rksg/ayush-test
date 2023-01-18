import { useContext } from 'react'

import {
  Form,
  Select,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { Tooltip }                from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { notAvailableMsg }        from '@acx-ui/utils'

import NetworkFormContext       from '../../NetworkFormContext'
import { ClientIsolationVenue } from '../../parser'
import * as UI                  from '../styledComponents'

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
  const form = Form.useFormInstance()
  // eslint-disable-next-line max-len
  const clientIsolationEnabled = useWatch<boolean>(['wlan','advancedCustomization','clientIsolation'])
  // eslint-disable-next-line max-len
  const clientIsolationAllowlistEnabled = useWatch<boolean>('clientIsolationAllowlistEnabled')
  // eslint-disable-next-line max-len
  const clientIsolationAllowlistEnabledInitValue = data?.venues?.some(v => v.clientIsolationAllowlistId)

  const clientIsolationVenues = useWatch<ClientIsolationVenue[]>('clientIsolationVenues')

  const setAllowList = (venueId: string, policyId: string) => {
    const clientIsolationVenue: ClientIsolationVenue = {
      venueId,
      clientIsolationAllowlistId: policyId
    }

    if (!clientIsolationVenues || clientIsolationVenues.length === 0) {
      form.setFieldValue('clientIsolationVenues', [clientIsolationVenue])
      return
    }

    const targetIndex = clientIsolationVenues.findIndex(v => v.venueId === venueId)

    if (targetIndex === -1) {
      clientIsolationVenues.push(clientIsolationVenue)
    } else {
      clientIsolationVenues.splice(targetIndex, 1, clientIsolationVenue)
    }

    form.setFieldValue('clientIsolationVenues', clientIsolationVenues)
  }

  return (<>
    <UI.FieldLabel width='125px'>
      {$t({ defaultMessage: 'Client Isolation:' })}

      <Form.Item
        name={['wlan','advancedCustomization','clientIsolation']}
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch />}
      />
    </UI.FieldLabel>

    {clientIsolationEnabled &&
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Isolate Packets:' })}
        name={['wlan','advancedCustomization','clientIsolationOptions', 'packetsType']}
      >
        <Select defaultValue={IsolatePacketsTypeEnum.UNICAST}
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
      <Tooltip {...(isPoliciesEnabled ? {} : { title: $t(notAvailableMsg) })}>
        <UI.FieldLabel width='230px'>
          {$t({ defaultMessage: 'Client Isolation Allowlist by Venue:' })}
          <Form.Item
            name='clientIsolationAllowlistEnabled'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={clientIsolationAllowlistEnabledInitValue}
            children={<Switch disabled={!isPoliciesEnabled} />} />
        </UI.FieldLabel>
      </Tooltip>
      {clientIsolationAllowlistEnabled && isPoliciesEnabled &&
        <Form.Item
          name={['clientIsolationVenues']}
        >
          <ClientIsolationAllowListEditor
            networkVenues={data?.venues}
            setAllowList={setAllowList}
          />
        </Form.Item>
      }
    </>
    }
  </>
  )
}

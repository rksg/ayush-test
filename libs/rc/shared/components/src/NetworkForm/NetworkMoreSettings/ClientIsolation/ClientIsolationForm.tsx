import { useContext, useEffect } from 'react'

import { Form, Select, Switch } from 'antd'
import { useIntl }              from 'react-intl'


import { ConfigTemplateType, IsolatePacketsTypeEnum, getIsolatePacketsTypeOptions } from '@acx-ui/rc/utils'

import NetworkFormContext                                                              from '../../NetworkFormContext'
import { useNetworkVxLanTunnelProfileInfo, useServicePolicyEnabledWithConfigTemplate } from '../../utils'
import * as UI                                                                         from '../styledComponents'

import ClientIsolationAllowListEditor from './ClientIsolationAllowListEditor'

const { useWatch } = Form

export default function ClientIsolationForm (props: { labelWidth?: string }) {
  const form = Form.useFormInstance()
  const { data } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const isClientIsolationAllowlistSupported = useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.CLIENT_ISOLATION)

  const { labelWidth='250px' } = props

  // eslint-disable-next-line max-len
  const clientIsolationEnabled = useWatch<boolean>(['wlan','advancedCustomization','clientIsolation'])
  // eslint-disable-next-line max-len
  const clientIsolationAllowlistEnabled = useWatch<boolean>(['wlan','advancedCustomization', 'clientIsolationAllowlistEnabled'])
  // eslint-disable-next-line max-len
  const clientIsolationAllowlistEnabledInitValue = data?.venues?.some(v => v.clientIsolationAllowlistId)
  useEffect(() => {
    if (data) {
      form.setFieldValue(['wlan','advancedCustomization','clientIsolationAllowlistEnabled'],
        (data?.venues?.some(v => v.clientIsolationAllowlistId)))
    }
  }, [data])

  const { enableVxLan } = useNetworkVxLanTunnelProfileInfo(data)

  const onClientIsolationEnabledChanged = (checked: boolean) => {
    if(!checked){
      form.setFieldValue(
        ['wlan','advancedCustomization','clientIsolationOptions', 'packetsType'], undefined)
    }
  }

  const clientIsolationDisabled = enableVxLan
  return (<>
    <UI.FieldLabel width={labelWidth}>
      {$t({ defaultMessage: 'Client Isolation' })}

      <Form.Item
        name={['wlan','advancedCustomization','clientIsolation']}
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch
          disabled={clientIsolationDisabled}
          onChange={onClientIsolationEnabledChanged}/>
        }
      />
    </UI.FieldLabel>

    {clientIsolationEnabled &&
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Isolate Packets' })}
        name={['wlan','advancedCustomization','clientIsolationOptions', 'packetsType']}
        initialValue={IsolatePacketsTypeEnum.UNICAST}
      >
        <Select
          style={{ width: '240px' }}
          options={getIsolatePacketsTypeOptions()}
        />
      </Form.Item>
      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Automatic support for VRRP/HSRP' })}
        <Form.Item
          name={['wlan','advancedCustomization','clientIsolationOptions', 'autoVrrp']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />} />
      </UI.FieldLabel>
      {isClientIsolationAllowlistSupported ? <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Client Isolation Allowlist by <VenueSingular></VenueSingular>' })}
        <Form.Item
          name={['wlan','advancedCustomization', 'clientIsolationAllowlistEnabled']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={clientIsolationAllowlistEnabledInitValue}
          children={<Switch />} />
      </UI.FieldLabel> : null}
      {clientIsolationAllowlistEnabled && isClientIsolationAllowlistSupported &&
        <ClientIsolationAllowListEditor networkVenues={data?.venues}/>
      }
    </>
    }
  </>
  )
}

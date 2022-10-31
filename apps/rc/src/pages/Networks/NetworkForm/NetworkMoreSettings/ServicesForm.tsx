
import React, { createContext, useState, useEffect, useContext } from 'react'

import {
  Checkbox,
  Form,
  InputNumber,
  Select,
  Switch,
  Tooltip
} from 'antd'
import { useIntl } from 'react-intl'

import { Button }                            from '@acx-ui/components'
import { notAvailableMsg }                   from '@acx-ui/utils'
import { DnsProxyRule, DnsProxyContextType, WifiCallingSettingContextType, WifiCallingSetting } from '@acx-ui/rc/utils'

import NetworkFormContext from '../NetworkFormContext'

import { DnsProxyModal }           from './DnsProxyModal'
import * as UI                     from './styledComponents'
import { WifiCallingSettingModal } from './WifiCallingSettingModal'
import WifiCallingSettingTable     from './WifiCallingSettingTable'

const { useWatch } = Form
const { Option } = Select

enum IsolatePacketsTypeEnum {
  UNICAST = 'UNICAST',
  MULTICAST = 'MULTICAST',
  UNICAST_MULTICAST = 'UNICAST_MULTICAST',
}

function ClientIsolationForm () {
  const { $t } = useIntl()
  const [
    enableClientIsolation
  ] = [
    useWatch<boolean>(['wlan','advancedCustomization','clientIsolation'])
  ]

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

    {enableClientIsolation &&
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
      <Tooltip title={$t(notAvailableMsg)}>
        <UI.FieldLabel width='230px'>
          {$t({ defaultMessage: 'Client Isolation Allowlist by Venue:' })}
          <Form.Item
            name='enableVenueClientIsolationAllowlist'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch disabled={true} />} />
        </UI.FieldLabel>
      </Tooltip>
    </>
    }
  </>
  )
}

export const DnsProxyContext = createContext({} as DnsProxyContextType)

export const WifiCallingSettingContext = createContext({} as WifiCallingSettingContextType)

export function ServicesForm () {
  const { $t } = useIntl()
  const [
    enableDnsProxy,
    enableAntiSpoofing,
    enableArpRequestRateLimit,
    enableDhcpRequestRateLimit,
    enableWifiCalling
  ] = [
    useWatch<boolean>(['wlan','advancedCustomization','dnsProxyEnabled']),
    useWatch<boolean>(['wlan','advancedCustomization','enableAntiSpoofing']),
    useWatch<boolean>(['wlan','advancedCustomization','enableArpRequestRateLimit']),
    useWatch<boolean>(['wlan','advancedCustomization','enableDhcpRequestRateLimit']),
    useWatch<boolean>(['wlan','advancedCustomization', 'wifiCallingEnabled'])
  ]

  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  useEffect(() => {
    if (data) {
      if (data.wlan?.advancedCustomization?.dnsProxy?.dnsProxyRules) {
        setDnsProxyList(
          data.wlan.advancedCustomization.dnsProxy.dnsProxyRules
        )
        form.setFieldsValue({
          dnsProxyRules: data.wlan.advancedCustomization.dnsProxy.dnsProxyRules
        })
      }
    }
  }, [data])

  const [dnsProxyList, setDnsProxyList] = useState([] as DnsProxyRule[])

  const [wifiCallingSettingList, setWifiCallingSettingList] = useState([] as WifiCallingSetting[])

  return (
    <>
      <UI.FieldLabel width='125px'>
        { $t({ defaultMessage: 'DNS Proxy:' }) }
        <UI.FieldLabel width='30px'>
          <Form.Item
            name={['wlan','advancedCustomization','dnsProxyEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
          <Form.Item
            name='dnsProxyRules'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
          >
            <DnsProxyContext.Provider value={{ dnsProxyList, setDnsProxyList }}>
              {enableDnsProxy && <DnsProxyModal />}
            </DnsProxyContext.Provider>
          </Form.Item>

        </UI.FieldLabel>
      </UI.FieldLabel>


      <Tooltip title={$t({ defaultMessage: 'Wi-Fi Calling service section.' })}>
        <UI.FieldLabel width='125px'>
          {$t({ defaultMessage: 'Wi-Fi Calling:' })}
          <UI.FieldLabel width='30px'>
            <Form.Item
              name={['wlan', 'advancedCustomization', 'wifiCallingEnabled']}
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
            <WifiCallingSettingContext.Provider
              value={{ wifiCallingSettingList, setWifiCallingSettingList }}>
              <Form.Item
                name={['wlan', 'advancedCustomization', 'wifiCallingIds']}
                initialValue={wifiCallingSettingList}
              >
                {enableWifiCalling && <WifiCallingSettingModal />}
                {enableWifiCalling && <WifiCallingSettingTable />}
              </Form.Item>
            </WifiCallingSettingContext.Provider>
          </UI.FieldLabel>
        </UI.FieldLabel>
      </Tooltip>

      <ClientIsolationForm/>
      <>
        <UI.FieldLabel width='125px'>
          {$t({ defaultMessage: 'Anti-spoofing:' })}
          <Form.Item
            name={['wlan','advancedCustomization','enableAntiSpoofing']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>
        {enableAntiSpoofing &&

        <>
          <div style={{ display: 'grid', gridTemplateColumns: '170px 60px 1fr', gap: 10 }}>
            <UI.FormItemNoLabel
              name={['wlan','advancedCustomization','enableArpRequestRateLimit']}
              valuePropName='checked'
              initialValue={true}
              children={<Checkbox children={$t({ defaultMessage: 'ARP request rate limit' })} />}
            />

            {enableArpRequestRateLimit && <>
              <Form.Item
                name={['wlan','advancedCustomization','arpRequestRateLimit']}
                initialValue={15}
                children={<InputNumber style={{ width: '100%' }} />} />
              <UI.Label>
                { $t({ defaultMessage: 'ppm' }) }
              </UI.Label>
            </>
            }
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '170px 60px 1fr', gap: 10 }}>
            <UI.FormItemNoLabel
              name={['wlan','advancedCustomization','enableDhcpRequestRateLimit']}
              valuePropName='checked'
              initialValue={true}
              children={<Checkbox children={$t({ defaultMessage: 'DHCP request rate limit' })} />}
            />

            {enableDhcpRequestRateLimit && <>
              <Form.Item
                name={['wlan','advancedCustomization','dhcpRequestRateLimit']}
                initialValue={15}
                children={<InputNumber style={{ width: '100%' }} />} />
              <UI.Label>
                { $t({ defaultMessage: 'ppm' }) }
              </UI.Label>
            </>}
          </div>
        </>
        }
      </>

      <UI.FormItemNoLabel
        name={['wlan', 'advancedCustomization', 'forceMobileDeviceDhcp']}
        valuePropName='checked'
        children={
          <Checkbox disabled={enableAntiSpoofing}
            children={$t({ defaultMessage: 'Force DHCP' })} />}
      />
      <UI.FormItemNoLabel
        name={['wlan','advancedCustomization','enableSyslog']}
        valuePropName='checked'
        children={
          <Checkbox children={
            $t({ defaultMessage: 'Enable logging client data to external syslog' })} />
        }
      />
    </>
  )
}

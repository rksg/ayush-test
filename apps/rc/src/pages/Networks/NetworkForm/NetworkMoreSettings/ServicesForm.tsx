
import React, { createContext, useState, useEffect, useContext } from 'react'

import {
  Checkbox,
  Form,
  InputNumber,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { DnsProxyRule, DnsProxyContextType, WifiCallingSettingContextType, WifiCallingSetting } from '@acx-ui/rc/utils'

import NetworkFormContext from '../NetworkFormContext'

import ClientIsolationForm         from './ClientIsolation/ClientIsolationForm'
import { DnsProxyModal }           from './DnsProxyModal'
import * as UI                     from './styledComponents'
import { WifiCallingSettingModal } from './WifiCallingSettingModal'
import WifiCallingSettingTable     from './WifiCallingSettingTable'

const { useWatch } = Form

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

  const validateWifiCallingSetting = () => {
    if (enableWifiCalling && wifiCallingSettingList.length === 0) {
      return Promise.reject($t({
        defaultMessage: 'Could not enable wifi-calling with no profiles selected'
      }))
    }
    return Promise.resolve()
  }

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
              rules={[
                { validator: () => validateWifiCallingSetting() }
              ]}
            >
              {enableWifiCalling && <WifiCallingSettingModal />}
              {enableWifiCalling && <WifiCallingSettingTable />}
            </Form.Item>
          </WifiCallingSettingContext.Provider>
        </UI.FieldLabel>
      </UI.FieldLabel>

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
                rules={[{
                  type: 'number', max: 100, min: 15,
                  message: $t({
                    defaultMessage: 'ARP request rate limit must be between 15 and 100'
                  })
                }]}
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
                rules={[{
                  type: 'number', max: 100, min: 15,
                  message: $t({
                    defaultMessage: 'DHCP request rate limit must be between 15 and 100'
                  })
                }]}
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


import React, { createContext, useState, useEffect, useContext } from 'react'

import {
  Checkbox,
  Form,
  InputNumber,
  Switch,
  Tooltip
} from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { QuestionMarkCircleOutlined }                                                                                                  from '@acx-ui/icons'
import { useExternalProvidersQuery }                                                                                                   from '@acx-ui/rc/services'
import { DnsProxyRule, DnsProxyContextType, WifiCallingSettingContextType, WifiCallingSetting, NetworkTypeEnum, GuestNetworkTypeEnum } from '@acx-ui/rc/utils'

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

  const { editMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const params = useParams()
  const [showSingleSessionIdAccounting, setShowSingleSessionIdAccounting]=useState(false)
  const wlanData = (editMode) ? data : form.getFieldsValue()
  const providerData = useExternalProvidersQuery({ params })

  useEffect(() => {
    if (wlanData && data && providerData.data) {
      const isProviderHasAccountingService = function () {
        const providers = providerData?.data?.providers
        const providerName = wlanData?.guestPortal?.wisprPage?.externalProviderName
        const selectedProvider = _.find(providers, p => p.name === providerName)
        const region = (selectedProvider?.regions) ? selectedProvider.regions[0] : null
        return !!(region && region.accountingRadius)
      }

      const showFlag =
        (wlanData?.enableAccountingService && data.type === NetworkTypeEnum.AAA) || (
          data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
          wlanData?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr &&
          isProviderHasAccountingService()
        )
      setShowSingleSessionIdAccounting(showFlag)
    }
  }, [wlanData, data, providerData])

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
  const setEnableDnsProxy = (enable: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'dnsProxyEnabled'], enable)
  }

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
            <DnsProxyContext.Provider
              value={{ dnsProxyList, setDnsProxyList, setEnableDnsProxy }}>
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

      {showSingleSessionIdAccounting &&
        <UI.FormItemNoLabel
          name={['wlan', 'advancedCustomization', 'singleSessionIdAccounting']}
          valuePropName='checked'
          children={
            <Checkbox disabled={enableAntiSpoofing}
              children={
                <>
                  {$t({ defaultMessage: 'Single session ID Accounting' })}
                  <Tooltip
                    // eslint-disable-next-line max-len
                    title={$t({ defaultMessage: 'APs will maintain one accounting session for client roaming' })}
                    placement='bottom'>
                    <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3 }} />
                  </Tooltip>
                </>
              } />}
        />

      }

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

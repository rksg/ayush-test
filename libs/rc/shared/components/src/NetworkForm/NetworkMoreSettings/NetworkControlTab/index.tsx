/* eslint-disable max-len */
import { createContext, useContext, useEffect, useState } from 'react'

import { Checkbox, Form, InputNumber, Switch, Space } from 'antd'
import { useIntl }                                    from 'react-intl'
import { useParams }                                  from 'react-router-dom'

import { StepsForm, Tooltip }         from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { useGetPrivacySettingsQuery } from '@acx-ui/rc/services'
import {
  DnsProxyContextType,
  DnsProxyRule,
  WifiCallingSetting,
  WifiCallingSettingContextType,
  ConfigTemplateType,
  PrivacyFeatureName } from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier } from '@acx-ui/user'

import NetworkFormContext                            from '../../NetworkFormContext'
import { useServicePolicyEnabledWithConfigTemplate } from '../../utils'
import { AccessControlForm }                         from '../AccessControlForm'
import ClientIsolationForm                           from '../ClientIsolation/ClientIsolationForm'
import { DhcpOption82Form }                          from '../DhcpOption82Form'
import { DnsProxyModal }                             from '../DnsProxyModal'
import * as UI                                       from '../styledComponents'
import { WifiCallingSettingModal }                   from '../WifiCallingSettingModal'
import WifiCallingSettingTable                       from '../WifiCallingSettingTable'


export const DnsProxyContext = createContext({} as DnsProxyContextType)

export const WifiCallingSettingContext = createContext({} as WifiCallingSettingContextType)

const { useWatch } = Form

// move from ServicesForm.tsx
export function NetworkControlTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { data, cloneMode, editMode } = useContext(NetworkFormContext)
  const { accountTier } = getUserProfile()

  const isCore = isCoreTier(accountTier)
  const labelWidth = '250px'

  const isWifiCallingSupported = useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.WIFI_CALLING)
  const wifi_network_application_control_FF = useIsSplitOn(Features.WIFI_NETWORK_APPLICATION_CONTROL) && !isCore
  const isMspAppMonitoringEnabled = useIsSplitOn(Features.MSP_APP_MONITORING)

  const { data: privacySettingsData } = useGetPrivacySettingsQuery({ params }, { skip: !(isMspAppMonitoringEnabled && !(cloneMode || editMode)) })

  const applicationRecognitionControlTooltipContent = $t({ defaultMessage:
    `Application Recognition & Control (ARC) manages the usage and reporting of network guest application activities.
    Disabling this feature stops the monitoring and reporting of these activities. ` })

  const form = Form.useFormInstance()
  const [
    enableDnsProxy,
    enableAntiSpoofing,
    enableArpRequestRateLimit,
    enableDhcpRequestRateLimit,
    enableWifiCalling
  ] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'dnsProxyEnabled']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableAntiSpoofing']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableArpRequestRateLimit']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableDhcpRequestRateLimit']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'wifiCallingEnabled'])
  ]

  useEffect(() => {
    if (data) {
      const dnsProxyRulesData = data.wlan?.advancedCustomization?.dnsProxy?.dnsProxyRules
      if (dnsProxyRulesData) {
        const dnsProxyRules = dnsProxyRulesData.map( rule => ({
          ...rule,
          key: rule.domainName
        }))
        setDnsProxyList(dnsProxyRules)
        form.setFieldsValue({ dnsProxyRules })
      }
    }
  }, [data])

  useEffect(() => {
    if (privacySettingsData) {
      const privacyMonitoringSetting =
      privacySettingsData.filter(item => item.featureName === PrivacyFeatureName.ARC)[0]
      form.setFieldsValue({
        wlan: {
          advancedCustomization: {
            applicationVisibilityEnabled: privacyMonitoringSetting.isEnabled
          }
        }
      })
    }
  }, [privacySettingsData])

  useEffect(() => {
    if (form && enableAntiSpoofing) {
      const forceDhcpFieldName = ['wlan', 'advancedCustomization', 'forceMobileDeviceDhcp']
      const forceDhcp = form.getFieldValue(forceDhcpFieldName)
      if (forceDhcp === false) {
        form.setFieldValue(forceDhcpFieldName, enableAntiSpoofing)
      }
    }

  }, [enableAntiSpoofing, form])

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
      <UI.FieldLabel width={labelWidth}>
        { $t({ defaultMessage: 'DNS Proxy' }) }
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

      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Wi-Fi Calling' })}
        <UI.FieldLabel width='30px'>
          <Form.Item
            name={['wlan', 'advancedCustomization', 'wifiCallingEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch disabled={!isWifiCallingSupported} />}
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
              {enableWifiCalling ? <>
                <WifiCallingSettingModal />
                <WifiCallingSettingTable />
              </> : <></>}
            </Form.Item>
          </WifiCallingSettingContext.Provider>
        </UI.FieldLabel>
      </UI.FieldLabel>

      <div style={{ maxWidth: '600px' }}>
        <ClientIsolationForm labelWidth={labelWidth} />
      </div>

      <>
        <UI.FieldLabel width={labelWidth}>
          {$t({ defaultMessage: 'Anti-spoofing' })}
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

      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Logging client data to external syslog' })}
        <Form.Item
          name={['wlan','advancedCustomization','enableSyslog']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      {
        wifi_network_application_control_FF &&
        <UI.FieldLabel width={labelWidth}>
          <Space align='start'>
            {$t({ defaultMessage: 'Application Recognition & Control' })}
            <Tooltip.Question
              title={applicationRecognitionControlTooltipContent}
              placement='right'
              iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
            />
          </Space>
          <Form.Item
            name={['wlan','advancedCustomization','applicationVisibilityEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={true}
            children={<Switch />}
            data-testid='arcForm'
          />
        </UI.FieldLabel>
      }

      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'DHCP' })}
      </StepsForm.Subtitle>
      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Force DHCP' })}
        <Form.Item
          name={['wlan', 'advancedCustomization', 'forceMobileDeviceDhcp']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch disabled={enableAntiSpoofing} />}
        />
      </UI.FieldLabel>

      <DhcpOption82Form labelWidth={'240px'} />

      <AccessControlForm/>
    </>
  )
}


import { createContext, useState, useEffect, useContext } from 'react'

import {
  Checkbox,
  Form,
  InputNumber,
  Switch,
  Tooltip,
  Select,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import { Features, useIsTierAllowed, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                                       from '@acx-ui/icons'
import { useGetTunnelProfileViewDataListQuery, useGetNetworkSegmentationViewDataListQuery } from '@acx-ui/rc/services'
import {
  DnsProxyRule,
  DnsProxyContextType,
  WifiCallingSettingContextType,
  WifiCallingSetting,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType,
  DpskWlanAdvancedCustomization } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import NetworkFormContext        from '../NetworkFormContext'
import { hasVxLanTunnelProfile } from '../utils'

import ClientIsolationForm         from './ClientIsolation/ClientIsolationForm'
import { DhcpOption82Form }        from './DhcpOption82Form'
import { DnsProxyModal }           from './DnsProxyModal'
import * as UI                     from './styledComponents'
import { WifiCallingSettingModal } from './WifiCallingSettingModal'
import WifiCallingSettingTable     from './WifiCallingSettingTable'

const { useWatch } = Form

export const DnsProxyContext = createContext({} as DnsProxyContextType)

export const WifiCallingSettingContext = createContext({} as WifiCallingSettingContextType)

export function ServicesForm (props: { showSingleSessionIdAccounting: boolean }) {
  const { $t } = useIntl()
  const dhcpOption82Flag = useIsSplitOn(Features.WIFI_FR_6029_FG4_TOGGLE)
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


  const { showSingleSessionIdAccounting } = props

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

  const showTunnelProfile = hasVxLanTunnelProfile(data)
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const tunnelProfileDefaultPayload = {
    fields: ['name', 'id'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const { tunnelOptions = [], isLoading: isTunnelLoading } = useGetTunnelProfileViewDataListQuery({
    payload: tunnelProfileDefaultPayload
  }, {
    skip: !isEdgeEnabled || !isEdgeReady,
    selectFromResult: ({ data, isLoading }) => {
      return {
        tunnelOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })

  const tunnelProfileId =
    (data?.wlan?.advancedCustomization as DpskWlanAdvancedCustomization)?.tunnelProfileId
  const {
    nsgId
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { vxlanTunnelProfileId: [ tunnelProfileId ] }
    }
  }, {
    skip: !!!tunnelProfileId || !!!isEdgeEnabled,
    selectFromResult: ({ data }) => {
      return {
        nsgId: data?.data[0]?.id
      }
    }
  })

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
          name={['wlan', 'advancedCustomization', 'radiusOptions', 'singleSessionIdAccounting']}
          valuePropName='checked'
          children={
            <Checkbox
              children={
                <>
                  {$t({ defaultMessage: 'Single Session ID Accounting' })}
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

      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Enable logging client data to external syslog' })}
        <Form.Item
          name={['wlan','advancedCustomization','enableSyslog']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      <UI.Subtitle>
        {$t({ defaultMessage: 'DHCP' })}
      </UI.Subtitle>
      <UI.FieldLabel width='182px'>
        {$t({ defaultMessage: 'Force DHCP' })}
        <Form.Item
          name={['wlan', 'advancedCustomization', 'forceMobileDeviceDhcp']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch disabled={enableAntiSpoofing} />}
        />
      </UI.FieldLabel>

      {dhcpOption82Flag && <DhcpOption82Form/>}

      { showTunnelProfile &&
      <Form.Item
        name={['wlan','advancedCustomization','tunnelProfileId']}
        label={$t({ defaultMessage: 'Tunnel Profile' })}
        children={
          <Select
            loading={isTunnelLoading}
            options={tunnelOptions}
            disabled={true}
          />
        }
      />
      }

      { showTunnelProfile &&
        <Space size={1}>
          <UI.InfoIcon />
          <UI.Description>
            {
              $t({
                defaultMessage: `All networks under the same Network Segmentation
                share the same tunnel profile. Go `
              })
            }
            &nbsp;
            <Space size={1}></Space>
            { nsgId &&
            <TenantLink to={getServiceDetailsLink({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.DETAIL,
              serviceId: nsgId!
            })}>
              { $t({ defaultMessage: 'here' }) }
            </TenantLink>
            }
            &nbsp;
            {
              $t({
                defaultMessage: 'to change'
              })
            }
          </UI.Description>
        </Space>
      }

    </>
  )
}


import React from 'react'

import {
  Button,
  Form,
  Input,
  Select,
  Switch,
  Tooltip
} from 'antd'


import { DnsProxyModal } from './DnsProxyModal'
import * as UI           from './styledComponents'


const { useWatch } = Form
const { Option } = Select

enum IsolatePacketsTypeEnum {
  UNICAST = 'UNICAST',
  MULTICAST = 'MULTICAST',
  UNICAST_MULTICAST = 'UNICAST_MULTICAST',
}


function ClientIsolationForm () {
  const [
    enableClientIsolation
  ] = [
    useWatch<boolean>(['moresettings','advancedCustomization','clientIsolation'])
  ]

  return (<>
    <UI.FieldLabel width='125px'>
      Client Isolation:
      <Form.Item
        name={['moresettings','advancedCustomization','clientIsolation']}
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch />}
      />
    </UI.FieldLabel>

    {enableClientIsolation &&
    <>
      <Form.Item
        label='Isolate Packets:'
        name={['moresettings','advancedCustomization','clientIsolationOptions', 'packetsType']}
      >
        <Select defaultValue={IsolatePacketsTypeEnum.UNICAST}
          style={{ width: '240px' }}>
          <Option value={IsolatePacketsTypeEnum.UNICAST}>
            Unicast
          </Option>
          <Option value={IsolatePacketsTypeEnum.MULTICAST}>
            Multicast/broadcast
          </Option>
          <Option value={IsolatePacketsTypeEnum.UNICAST_MULTICAST}>
            Unicast and multicast/broadcast
          </Option>

        </Select>
      </Form.Item>
      <UI.FieldLabel width='230px'>
        Automatic support for VRRP/HSRP:
        <Form.Item
          name={['moresettings','advancedCustomization','clientIsolationOptions', 'autoVrrp']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />} />
      </UI.FieldLabel>
      <UI.FieldLabel width='230px'>
        Client Isolation Allowlist by Venue:

        <Tooltip title={'Does not support in Beta.'}>
          <Form.Item

            name='enableVenueClientIsolationAllowlist'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />} />
        </Tooltip>
      </UI.FieldLabel>
      {/* Client Isolation Allowlist by Venue TODOTODO */}
    </>
    }
  </>
  )
}

export function ServicesForm () {
  const [
    enableDnsProxy,
    enableAntiSpoofing,
    enableArpRequestRateLimit,
    enableDhcpRequestRateLimit
  ] = [
    useWatch<boolean>(['moresettings','advancedCustomization','dnsProxyEnabled']),
    useWatch<boolean>(['moresettings','advancedCustomization','enableAntiSpoofing']),
    useWatch<boolean>(['moresettings','advancedCustomization','enableArpRequestRateLimit']),
    useWatch<boolean>(['moresettings','advancedCustomization','enableDhcpRequestRateLimit'])

  ]

  return (
    <>
      <UI.FieldLabel width='125px'>
        DNS Proxy:
        <UI.FieldLabel width='30px'>
          <Form.Item
            name={['moresettings','advancedCustomization','dnsProxyEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
          {enableDnsProxy &&
           <DnsProxyModal/>}

        </UI.FieldLabel>
      </UI.FieldLabel>


      <UI.FieldLabel width='125px'>
        Wi-Fi Calling:
        <UI.FieldLabel width='30px'>
        <Form.Item
            name={['moresettings', 'advancedCustomization', 'wifiCallingEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
          <Button type='link'
            style={{
              textAlign: 'left'
            }}
            disabled={true}>
          Select profiles </Button>
        </UI.FieldLabel>

      </UI.FieldLabel>

      <ClientIsolationForm/>
      <>
        <UI.FieldLabel width='125px'>
        Anti-spoofing:
          <Form.Item
            name={['moresettings','advancedCustomization','enableAntiSpoofing']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>
        {enableAntiSpoofing &&

        <>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 60px 1fr' }}>

            <span style={{ display: 'flex' }}>
              <UI.FormItemNoLabel
                name={['moresettings','advancedCustomization','enableArpRequestRateLimit']}
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={true}
                children={<UI.CheckboxWrapper/>}
              />
              <UI.Label style={{ lineHeight: '32px' }}>  ARP request rate limit
              </UI.Label>
            </span>


            {enableArpRequestRateLimit && <>
              <Form.Item
                name={['moresettings','advancedCustomization','arpRequestRateLimit']}
                initialValue={15}
                style={{ marginBottom: '10px', lineHeight: '32px' }}
                children={<Input style={{ width: '50px' }} />} />
              <UI.Label style={{ lineHeight: '34px' }}> ppm </UI.Label>
            </>
            }
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '160px 60px 1fr' }}>

            <span style={{ display: 'flex' }}>
              <UI.FormItemNoLabel
                name={['moresettings','advancedCustomization','enableDhcpRequestRateLimit']}
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={true}
                children={<UI.CheckboxWrapper />}
              />
              <UI.Label style={{ lineHeight: '34px' }}>
                DHCP request rate limit
              </UI.Label>
            </span>

            {enableDhcpRequestRateLimit && <>
              <Form.Item
                name={['moresettings','advancedCustomization','dhcpRequestRateLimit']}
                initialValue={15}
                style={{ marginBottom: '10px', lineHeight: '32px' }}
                children={<Input style={{ width: '50px' }} />} />
              <UI.Label style={{ lineHeight: '32px' }}> ppm </UI.Label>

            </>}
          </div>
        </>
        }
      </>

      <UI.FormItemNoLabel
        name={['moresettings','advancedCustomization','forceMobileDeviceDhcp']}

        children={
          <UI.Label>
            <UI.CheckboxWrapper
              disabled={enableAntiSpoofing} />
            Force DHCP
          </UI.Label>}
      />
      <UI.FormItemNoLabel
        name={['moresettings','advancedCustomization','enableSyslog']}
        children={
          <UI.Label>
            <UI.CheckboxWrapper />
            Enable logging client data to external syslog
          </UI.Label>}
      />
    </>
  )
}


import React from 'react'

import {
  Button,
  Form,
  Input,
  Select,
  Switch
} from 'antd'


import * as UI from './styledComponents'


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
    useWatch<boolean>('enableClientIsolation')
  ]

  return (<>
    <UI.FieldLabel width='125px'>
      Client Isolation:
      <Form.Item
        name='enableClientIsolation'
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
        name='isolatePackets'
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
      </Form.Item><UI.FieldLabel width='230px'>
          Automatic support for VRRP/HSRP:
        <Form.Item
          name='enableVrrpHsrpAutomaticSupport'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />} />
      </UI.FieldLabel><UI.FieldLabel width='230px'>
          Client Isolation Allowlist by Venue:
        <Form.Item
          name='enableVenueClientIsolationAllowlist'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />} />
      </UI.FieldLabel>
      {/* Client Isolation Allowlist by Venue TODOTODO */}
    </>
    }
  </>
  )
}

function AntiSpoofing () {
  const [
    enableAntiSpoofing,
    enableArpRequestRateLimit,
    enableDhcpRequestRateLimit
  ] = [
    useWatch<boolean>('enableAntiSpoofing'),
    useWatch<boolean>('enableArpRequestRateLimit'),
    useWatch<boolean>('enableDhcpRequestRateLimit')
  ]


  return (
    <>
      <UI.FieldLabel width='125px'>
        Anti-spoofing:
        <Form.Item
          name='enableAntiSpoofing'
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
                name='enableArpRequestRateLimit'
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={false}
                children={<UI.CheckboxWrapper />}
              />
              <UI.Label style={{ lineHeight: '32px' }}>  ARP request rate limit
              </UI.Label>
            </span>


            {enableArpRequestRateLimit && <>
              <Form.Item
                name='arpRequestRateLimit'
                style={{ marginBottom: '10px', lineHeight: '32px' }}
                children={<Input style={{ width: '50px' }} />} />
              <UI.Label style={{ lineHeight: '34px' }}> ppm </UI.Label>
            </>
            }
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '160px 60px 1fr' }}>

            <span style={{ display: 'flex' }}>
              <UI.FormItemNoLabel
                name='enableDhcpRequestRateLimit'
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={false}
                children={<UI.CheckboxWrapper />}
              />
              <UI.Label style={{ lineHeight: '34px' }}>
                DHCP request rate limit
              </UI.Label>
            </span>

            {enableDhcpRequestRateLimit && <>
              <Form.Item
                name='dhcpRequestRateLimit'
                style={{ marginBottom: '10px', lineHeight: '32px' }}
                children={<Input style={{ width: '50px' }} />} />
              <UI.Label style={{ lineHeight: '32px' }}> ppm </UI.Label>

            </>}
          </div>
        </>
      }
    </>
  )

}

export function ServicesForm () {
  const [
    enableDnsProxy
  ] = [
    useWatch<boolean>('enableDnsProxy')
  ]

  return (
    <>
      <UI.FieldLabel width='125px'>
        DNS Proxy:
        <UI.FieldLabel width='30px'>
          <Form.Item
            name='enableDnsProxy'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
          {enableDnsProxy &&
            <Button type='link' style={{ textAlign: 'left' }}>Manage</Button>}
        </UI.FieldLabel>
      </UI.FieldLabel>

      <UI.FieldLabel width='125px'>
        Wi-Fi Calling:
        <Form.Item
          name='enableWifiCalling'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      <ClientIsolationForm/>
      <AntiSpoofing/>

      <UI.FormItemNoLabel
        name='enableDhcp'
        children={
          <UI.Label>
            <UI.CheckboxWrapper />
            Force DHCP
          </UI.Label>}
      />
      <UI.FormItemNoLabel
        name='enableSyslog'
        children={
          <UI.Label>
            <UI.CheckboxWrapper />
            Enable logging client data to external syslog
          </UI.Label>}
      />
    </>
  )
}

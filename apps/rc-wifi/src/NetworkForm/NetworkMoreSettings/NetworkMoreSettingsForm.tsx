import React from 'react'

import {
  Collapse,
  Form,
  Input,
  Select,
  Switch,
  Slider
} from 'antd'

import { StepsForm } from '@acx-ui/components'

import * as UI from './styledComponents'
const { Panel } = Collapse
const { Option } = Select

enum MessageEnum {
  DIRECTED_MCBC_THRESHOLD = `Per radio client count at which an AP will stop
  converting group addressed data traffic to unicast`
}

export function NetworkMoreSettingsForm () {
  return (
    <UI.CollpasePanel
      defaultActiveKey={['1', '2', '3']}
      expandIconPosition='end'
      ghost={true}
      bordered={false}
      style={{ width: '600px' }}>

      <Panel header='VLAN' key='1' >
        <Form.Item
          name='enableVlanPooling'
          style={{ marginBottom: '10px' }}
          children={<>
            <UI.FieldLabel
              width='90px'>VLAN Pooling:</UI.FieldLabel>
            <Switch /></>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr' }}>
          <Form.Item
            name='vlanId'
            label='VLAN ID'
            style={{ marginBottom: '15px' }}
            children={<Input style={{ width: '66px' }}></Input>}
          />
          <Form.Item
            name='name'
            label={<span></span>}
            style={{ marginBottom: '15px' }}
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                Dynamic VLAN
              </UI.Label>}
          />
        </div>

        <UI.FormItemNoLabel
          name='enableProxyArp'
          children={<>
            <UI.FieldLabel
              width='90px'>Proxy ARP:</UI.FieldLabel>
            <Switch /></>}
        />
      </Panel>

      <Panel header='Services' key='2' >
        <UI.FormItemNoLabel
          name='enableDnsProxy'
          children={<>
            <UI.FieldLabel
              width='125px'>DNS Proxy:</UI.FieldLabel>
            <Switch /></>}
        />
        <UI.FormItemNoLabel
          name='enableWifiCalling'
          children={<>
            <UI.FieldLabel
              width='125px'>Wi-Fi Calling:</UI.FieldLabel>
            <Switch /></>}
        />
        <UI.FormItemNoLabel
          name='enableClientIsolation'
          children={<>
            <UI.FieldLabel
              width='125px'>Client Isolation:</UI.FieldLabel>
            <Switch /></>}
        />
        <UI.FormItemNoLabel
          name='enableAntiSpoofing'
          children={<>
            <UI.FieldLabel
              width='125px'>Anti-spoofing:</UI.FieldLabel>
            <Switch /></>}
        />
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
      </Panel>

      <Panel header='Radio' key='3' >
        <UI.FormItemNoLabel
          name='hideSsid'
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Hide SSID
            </UI.Label>}
        />

        <StepsForm.Title
          style={{
            fontSize: 'var(--acx-subtitle-4-font-size)',
            fontWeight: '600',
            margin: '20px 0'
          }}
        >Load Control</StepsForm.Title>

        <Form.Item
          label='Max Rate:'
          name='maxRate'
        >
          <Select defaultValue='umlimited'
            style={{ width: '240px' }}>
            <Option value='umlimited'>
              Unlimited
            </Option>
            <Option value='perAp'>Per AP</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label='Activated in Venues:'
          name='activatedInVenues'
        >
          <Slider
            style={{ width: '240px' }}
            defaultValue={100}
            min={1}
            max={512}
            marks={{ 0: '0', 512: '512' }}
          />
        </Form.Item>

        <UI.FormItemNoLabel
          name='enableDhcp'
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Enable load balancing between all radios
            </UI.Label>}
        />
        <UI.FormItemNoLabel
          name='enableDhcp'
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Enable load balancing between APs
            </UI.Label>}
        />


        <StepsForm.Title
          style={{
            fontSize: 'var(--acx-subtitle-4-font-size)',
            fontWeight: '600',
            margin: '20px 0'
          }}
        >Access Control</StepsForm.Title>

        <Form.Item
          name='enableAccessControl'
          style={{ marginBottom: '10px' }}
          children={<>
            <UI.FieldLabel
              width='90px'>Access Control:</UI.FieldLabel>
            <Switch /></>}
        />
        {/* TODOTODOTODO Access Control */}
        <Form.Item
          name='enableOfdm'
          label={<span></span>}
          style={{ marginBottom: '15px' }}
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Enable OFDM only (disable 802.11b)
            </UI.Label>}
        />
        {/* BBS Min Rate */}
        <Form.Item
          name='mobilityDomainId'
          label='Mobility Domain ID'
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '150px' }}></Input>}
        />
        <Form.Item
          name='clientInactivityTimeout'
          label='Client Inactivity Timeout:'
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '150px' }}></Input>}
        />
        <Form.Item
          name='directThreshold'
          label='Directed MC/BC Threshold:'
          style={{ marginBottom: '15px', width: '300px' }}
          extra={MessageEnum.DIRECTED_MCBC_THRESHOLD}
          children={<Input style={{ width: '150px' }}></Input>}
        />

        <Form.Item
          name='airtimedecongestion'
          style={{ marginBottom: '10px' }}
          children={<>
            <UI.FieldLabel
              width='190px'>Airtime Decongestion:</UI.FieldLabel>
            <Switch /></>}
        />
        <Form.Item
          name='transientClientManagement'
          style={{ marginBottom: '10px' }}
          children={<>
            <UI.FieldLabel
              width='190px'>Transient Client Management:</UI.FieldLabel>
            <Switch /></>}
        />
        <Form.Item
          name='joinWaitTime'
          label='Join Wait Time:'
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '65px' }}></Input>}
        />
        <Form.Item
          name='joinExpireTime'
          label='Join Expire Time:'
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '65px' }}></Input>}
        />
        <Form.Item
          name='joinWaitThreshold'
          label='Join Wait Threshold:'
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '65px' }}></Input>}
        />
        <Form.Item
          name='enableOce'
          style={{ marginBottom: '10px' }}
          children={<>
            <UI.FieldLabel
              width='250px'>Optimized Connectivity Experience (OCE):</UI.FieldLabel>
            <Switch /></>}
        />
        <Form.Item
          name='broadcastProbeResponseDelay'
          label='Broadcast Probe Response Delay:'
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '65px' }}></Input>}
        />
        <Form.Item
          name='rssiBasedAssociationRejectionThreshold'
          label='RSSI-Based Association Rejection Threshold:'
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '65px' }}></Input>}
        />

      </Panel>

    </UI.CollpasePanel>
  )
}

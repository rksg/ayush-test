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

import { ServicesForm } from './ServicesForm'
import * as UI          from './styledComponents'
import { LoadControlForm } from './LoadControlForm'
import { AccessControlForm } from './AccessControlForm'
const { Panel } = Collapse
const { Option } = Select


const { useWatch } = Form

enum MessageEnum {
  DIRECTED_MCBC_THRESHOLD = `Per radio client count at which an AP will stop
  converting group addressed data traffic to unicast`
}

function VlanForm () {
  const enableVlanPooling = useWatch<boolean>('enableVlanPooling')

  return (
    <>
      <UI.FieldLabel width='90px'>
        VLAN Pooling:
        <Form.Item
          name='enableVlanPooling'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      {!enableVlanPooling && <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr' }}>
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
      </div>}

      {enableVlanPooling &&
        <UI.FieldLabel width='90px'>
          Proxy ARP:
          <Form.Item
            name='enableProxyArp'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>
      }
    </>
  )
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
        <VlanForm/>
      </Panel>

      <Panel header='Services' key='2' >
        <ServicesForm />
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
        <LoadControlForm />

        <StepsForm.Title
          style={{
            fontSize: 'var(--acx-subtitle-4-font-size)',
            fontWeight: '600',
            margin: '20px 0'
          }}
        >Access Control</StepsForm.Title>
        <AccessControlForm />


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


        <UI.FieldLabel width='190px'>
          Airtime Decongestion:
          <Form.Item
            name='enableAirtimedecongestion'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>

        <UI.FieldLabel width='190px'>
          Join RSSI Threshold:
          <Form.Item
            name='enableJoinRSSIThreshold'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>

        <UI.FieldLabel width='190px'>
          Transient Client Management:
          <Form.Item
            name='enableTransientClientManagement'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>

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


        <UI.FieldLabel width='250px'>
          Optimized Connectivity Experience (OCE):
          <Form.Item
            name='enableOce'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>

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

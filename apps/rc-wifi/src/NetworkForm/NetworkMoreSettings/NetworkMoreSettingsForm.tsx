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

        <UI.FieldLabel width='125px'>
          DNS Proxy:
          <Form.Item
            name='enableDnsProxy'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>



        <UI.FieldLabel width='125px'>
          DNS Wi-Fi Calling:
          <Form.Item
            name='enableWifiCalling'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>

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






        <div style={{ display: 'grid', gridTemplateColumns: '160px 60px 1fr' }}>
          <UI.FormItemNoLabel
            name='enableArpRequestRateLimit'
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                ARP request rate limit
              </UI.Label>}
          />

          <Form.Item
            name='arpRequestRateLimit'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Input style={{ width: '50px' }}></Input>}
          />
          <UI.Label
            style={{ lineHeight: '32px' }}>
            ppm
          </UI.Label>
        </div>



        <div style={{ display: 'grid', gridTemplateColumns: '160px 60px 1fr' }}>
          <UI.FormItemNoLabel
            name='enableDhcpRequestRateLimit'
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                DHCP request rate limit
              </UI.Label>}
          />


          <Form.Item
            name='dhcpRequestRateLimit'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Input style={{ width: '50px' }}></Input>}
          />
          <UI.Label
            style={{ lineHeight: '32px' }}>
            ppm
          </UI.Label>
        </div>







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

        <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
          <UI.FormItemNoLabel
            name='uploadLimit'
            style={{ lineHeight: '32px' }}
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                Upload Limit
              </UI.Label>}
          />

          <Slider
            style={{ width: '245px' }}
            defaultValue={20}
            min={1}
            max={200}
            marks={{
              0: {
                style: {
                  fontSize: '10px',
                  color: '#ACAEB0'
                },
                label: '1 Mbps'
              }, 200: {
                style: {
                  width: '50px',
                  fontSize: '10px',
                  color: '#ACAEB0'
                },
                label: '200 Mbps'
              }
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
          <UI.FormItemNoLabel
            name='downloadLimit'
            style={{ lineHeight: '32px' }}
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                Download Limit
              </UI.Label>}
          />

          <Slider
            style={{ width: '245px' }}
            defaultValue={20}
            min={1}
            max={200}
            marks={{
              0: {
                style: {
                  fontSize: '10px',
                  color: '#ACAEB0'
                },
                label: '1 Mbps'
              }, 200: {
                style: {
                  width: '50px',
                  fontSize: '10px',
                  color: '#ACAEB0'
                },
                label: '200 Mbps'
              }
            }}
          />
        </div>


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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <UI.FieldLabel width='175px'>
            Layer 2
            <Form.Item
              name='enableLayer2'
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
          </UI.FieldLabel>

          <Form.Item
            name='layer2'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select defaultValue=''
                style={{ width: '180px' }}>
                <Option value=''>Select profile...</Option>
              </Select>}
          />
        </div>



        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <UI.FieldLabel width='175px'>
            Layer 3
            <Form.Item
              name='enableLayer3'
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
          </UI.FieldLabel>

          <Form.Item
            name='layer3'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select defaultValue=''
                style={{ width: '180px' }}>
                <Option value=''>Select profile...</Option>
              </Select>}
          />
        </div>



        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <UI.FieldLabel width='175px'>
            Device & OS
            <Form.Item
              name='enableDeviceOs'
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
          </UI.FieldLabel>

          <Form.Item
            name='deviceOs'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select defaultValue=''
                style={{ width: '180px' }}>
                <Option value=''>Select profile...</Option>
              </Select>}
          />
        </div>


        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <UI.FieldLabel width='175px'>
            Applications
            <Form.Item
              name='enableApplications'
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
          </UI.FieldLabel>

          <Form.Item
            name='applications'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select defaultValue=''
                style={{ width: '180px' }}>
                <Option value=''>Select profile...</Option>
              </Select>}
          />
        </div>

        <UI.FieldLabel width='175px'>
          Client Rate Limit
          <Form.Item
            name='enableClientRateLimit'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>

        <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
          <UI.FormItemNoLabel
            name='uploadLimit'
            style={{ lineHeight: '32px' }}
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                Upload Limit
              </UI.Label>}
          />

          <Slider
            style={{ width: '245px' }}
            defaultValue={20}
            min={1}
            max={200}
            marks={{
              0: {
                style: {
                  fontSize: '10px',
                  color: '#ACAEB0'
                },
                label: '1 Mbps'
              }, 200: {
                style: {
                  width: '50px',
                  fontSize: '10px',
                  color: '#ACAEB0'
                },
                label: '200 Mbps'
              }
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
          <UI.FormItemNoLabel
            name='downloadLimit'
            style={{ lineHeight: '32px' }}
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                Download Limit
              </UI.Label>}
          />

          <Slider
            style={{ width: '245px' }}
            defaultValue={20}
            min={1}
            max={200}
            marks={{
              0: {
                style: {
                  fontSize: '10px',
                  color: '#ACAEB0'
                },
                label: '1 Mbps'
              }, 200: {
                style: {
                  width: '50px',
                  fontSize: '10px',
                  color: '#ACAEB0'
                },
                label: '200 Mbps'
              }
            }}
          />
        </div>


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

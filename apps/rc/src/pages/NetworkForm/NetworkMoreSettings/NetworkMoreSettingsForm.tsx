import React from 'react'

import {
  Collapse,
  Form,
  Input,
  Select,
  Switch
} from 'antd'

import { StepsForm } from '@acx-ui/components'

import { AccessControlForm } from './AccessControlForm'
import { LoadControlForm }   from './LoadControlForm'
import { ServicesForm }      from './ServicesForm'
import * as UI               from './styledComponents'
const { Panel } = Collapse

const { useWatch } = Form
const { Option } = Select

enum MessageEnum {
  DIRECTED_MCBC_THRESHOLD = `Per radio client count at which an AP will stop
  converting group addressed data traffic to unicast`
}

enum BssMinRateEnum {
  VALUE_NONE = 'default',
  VALUE_12 = 12,
  VALUE_24 = 24
}

enum MgmtTxRateEnum {
  VALUE_1 = 1,
  VALUE_2 = 2,
  VALUE_5_5 = 5.5,
  VALUE_6 = 6,
  VALUE_9 = 9,
  VALUE_11 = 11,
  VALUE_12 = 12,
  VALUE_18 = 18,
  VALUE_24 = 24
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
          initialValue={1}
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '66px' }}></Input>}
        />

        <UI.FieldLabel width='auto' style={{ marginTop: '20px' }}>
          <UI.FormItemNoLabel
            name='dynamicVlan'
            style={{ marginBottom: '15px' , marginRight: '8px' }}
            valuePropName='checked'
            initialValue={true}
            children={
              <UI.CheckboxWrapper />
            }
          />
          Dynamic VLAN
        </UI.FieldLabel>

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
  const [
    enableOfdmOnly,
    enable80211rFastBss,
    enableAirtimedecongestion,
    enableJoinRSSIThreshold,
    enableTransientClientManagement,
    enableOce
  ] = [
    useWatch<boolean>('enableOfdmOnly'),
    useWatch<boolean>('enable80211rFastBss'),
    useWatch<boolean>('enableAirtimedecongestion'),
    useWatch<boolean>('enableJoinRSSIThreshold'),
    useWatch<boolean>('enableTransientClientManagement'),
    useWatch<boolean>('enableOce')
  ]

  return (
    <UI.CollpasePanel
      defaultActiveKey={['1', '2', '3']}
      expandIconPosition='end'
      ghost={true}
      bordered={false}
      style={{ width: '600px' }}>

      <Panel header='VLAN' key='1' >
        <VlanForm />
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


        <AccessControlForm/>


        <UI.FormItemNoLabel
          name='enableOfdmOnly'
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          initialValue={false}
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Enable OFDM only (disable 802.11b)
            </UI.Label>}
        />

        <StepsForm.Title
          style={{
            fontSize: 'var(--acx-subtitle-4-font-size)',
            fontWeight: '600',
            margin: '20px 0'
          }}>
          <div> Data Rate Control </div>
          <div> 2.4 GHz & 5 GHz </div>
        </StepsForm.Title>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: '20px'
        }}>

          <Form.Item
            name='bbsMinRate'
            label='BBS Min Rate:'
            style={{ marginBottom: '15px' }}
            children={
              <BbsMinRateSelect />
            } />

          <Form.Item
            name='mgmtTxRate'
            label='Mgmt Tx Rate:'
            style={{ marginBottom: '15px' }}
            children={
              <MgmtTxRateSelect disabled={enableOfdmOnly} />
            } />
        </div>

        <UI.FormItemNoLabel
          name='enable80211kNeighbor'
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          initialValue={false}
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Enable 802.11k neighbor reports
            </UI.Label>}
        />

        <UI.FormItemNoLabel
          name='enable80211rFastBss'
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          initialValue={false}
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Enable 802.11r Fast BSS Transition
            </UI.Label>}
        />

        {enable80211rFastBss &&
          <>
            <Form.Item
              name='mobilityDomainId'
              label='Mobility Domain ID'
              initialValue={1}
              style={{ marginBottom: '15px' }}
              children={<Input style={{ width: '150px' }}></Input>} />

            <Form.Item
              name='clientInactivityTimeout'
              label='Client Inactivity Timeout:'
              initialValue={120}
              style={{ marginBottom: '15px' }}
              children={<Input style={{ width: '150px' }}></Input>} />
          </>
        }

        <Form.Item
          name='directThreshold'
          label='Directed MC/BC Threshold:'
          initialValue={5}
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

        {!enableAirtimedecongestion &&
          <UI.FieldLabel width='190px'>
            Join RSSI Threshold:
            <div style={{ display: 'grid', gridTemplateColumns: '50px 75px auto' }}>
              <Form.Item
                name='enableJoinRSSIThreshold'
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={false}
                children={<Switch />}
              />

              {enableJoinRSSIThreshold && <>
                <Form.Item
                  name='joinRSSIThreshold'
                  style={{ marginBottom: '10px', lineHeight: '32px' }}
                  initialValue={-85}
                  children={<Input style={{ width: '65px' }} />}
                />
                dBm
              </>}
            </div>
          </UI.FieldLabel>
        }

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
        {enableTransientClientManagement &&
          <>

            <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
              <UI.LabelOfInput>
                Seconds
              </UI.LabelOfInput>
              <Form.Item
                name='joinWaitTime'
                label='Join Wait Time:'
                style={{ marginBottom: '15px' }}
                initialValue={30}
                children={<Input style={{ width: '65px' }}></Input>}
              />

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
              <UI.LabelOfInput>
                Seconds
              </UI.LabelOfInput>
              <Form.Item
                name='joinExpireTime'
                label='Join Expire Time:'
                style={{ marginBottom: '15px' }}
                initialValue={300}
                children={<Input style={{ width: '65px' }}></Input>}
              />

            </div>


            <Form.Item
              name='joinWaitThreshold'
              label='Join Wait Threshold:'
              style={{ marginBottom: '15px' }}
              initialValue={10}
              children={<Input style={{ width: '65px' }}></Input>}
            />
          </>

        }
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

        {enableOce &&
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
              <UI.LabelOfInput>
                ms
              </UI.LabelOfInput>
              <Form.Item
                name='broadcastProbeResponseDelay'
                label='Broadcast Probe Response Delay:'
                style={{ marginBottom: '15px' }}
                initialValue={15}
                valuePropName='value'
                children={
                  <Input style={{ width: '65px', marginRight: '10px' }}></Input>
                }
              />

            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
              <UI.LabelOfInput>
                dBm
              </UI.LabelOfInput>
              <Form.Item
                name='rssiBasedAssociationRejectionThreshold'
                label='RSSI-Based Association Rejection Threshold:'
                style={{ marginBottom: '15px' }}
                initialValue={-75}
                valuePropName='value'
              >
                <Input style={{ width: '65px', marginRight: '10px' }}></Input>
              </Form.Item>
            </div>
          </>}
      </Panel>
    </UI.CollpasePanel>
  )
}

function BbsMinRateSelect () {
  return (
    <Select
      defaultValue={BssMinRateEnum.VALUE_NONE}
      style={{ width: '150px' }}>
      <Option value={BssMinRateEnum.VALUE_NONE}>
        None
      </Option>
      <Option value={BssMinRateEnum.VALUE_12}>
        12 Mbps
      </Option>
      <Option value={BssMinRateEnum.VALUE_24}>
        24 Mbps
      </Option>
    </Select>
  )
}

function MgmtTxRateSelect (props: {
  disabled: boolean;
}) {
  return (
    <Select
      disabled={props.disabled}
      defaultValue={MgmtTxRateEnum.VALUE_1}
      style={{ width: '150px' }}>
      <Option value={MgmtTxRateEnum.VALUE_1}>
        1 Mbps
      </Option>
      <Option value={MgmtTxRateEnum.VALUE_2}>
        2 Mbps
      </Option>
      <Option value={MgmtTxRateEnum.VALUE_5_5}>
        5.5 Mbps
      </Option>
      <Option value={MgmtTxRateEnum.VALUE_6}>
        6 Mbps
      </Option>
      <Option value={MgmtTxRateEnum.VALUE_9}>
        9 Mbps
      </Option>
      <Option value={MgmtTxRateEnum.VALUE_11}>
        11 Mbps
      </Option>
      <Option value={MgmtTxRateEnum.VALUE_12}>
        12 Mbps
      </Option>
      <Option value={MgmtTxRateEnum.VALUE_18}>
        18 Mbps
      </Option>
      <Option value={MgmtTxRateEnum.VALUE_24}>
        24 Mbps
      </Option>
    </Select>
  )
}

import React from 'react'

import {
  Collapse,
  Form,
  Input,
  Select,
  Switch
} from 'antd'

import { StepsForm }     from '@acx-ui/components'
import {
  useVlanPoolListQuery
} from '@acx-ui/rc/services'
import { NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { useParams }                                          from '@acx-ui/react-router-dom'

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

const listPayload = {
  fields: ['name', 'id'], sortField: 'name',
  sortOrder: 'ASC', page: 1, pageSize: 10000
}

export function NetworkMoreSettingsForm (props: {
  wlanData: NetworkSaveData
}) {
  const [
    enableOfdmOnly,
    enableFastRoaming,
    enableAirtimedecongestion,
    enableJoinRSSIThreshold,
    enableTransientClientManagement,
    enableOce,
    enableVlanPooling
  ] = [
    useWatch<boolean>('enableOfdmOnly'),
    useWatch<boolean>(['wlan','advancedCustomization','enableFastRoaming']),
    useWatch<boolean>(['wlan','advancedCustomization','enableAirtimedecongestion']),
    useWatch<boolean>(['wlan','advancedCustomization','enableJoinRSSIThreshold']),
    useWatch<boolean>(['wlan','advancedCustomization','enableTransientClientManagement']),
    useWatch<boolean>(['wlan','advancedCustomization',
      'enableOptimizedConnectivityExperience']),
    useWatch<boolean>('enableVlanPooling')
  ]

  const { wlanData } = props

  const isNetworkWPASecured = props.wlanData.wlanSecurity === WlanSecurityEnum.WPA2Personal ||
    props.wlanData.wlanSecurity === WlanSecurityEnum.WPAPersonal ||
    props.wlanData.wlanSecurity === WlanSecurityEnum.WPA2Enterprise
  const isFastBssVisible = (isNetworkWPASecured || wlanData.type === NetworkTypeEnum.AAA) &&
    wlanData.type !== NetworkTypeEnum.DPSK

  // TODO: Wait for captivePortal
  // const showSingleSessionIdAccounting = (wlanData.accountingRadius && (wlanData.type === NetworkTypeEnum.AAA)) ||
  // (wlanData.type === NetworkTypeEnum.CAPTIVEPORTAL &&
  //   wlanData.type.guestPortal.guestNetworkType === GuestNetworkTypeEnum.WISPr &&
  //   this.networkService.isProviderHasAccountingService(this.network));

  const showDynamicWlan = wlanData.type === NetworkTypeEnum.AAA ||
    wlanData.type === NetworkTypeEnum.DPSK

  // TODO: Wait for captivePortal
  // this.showMaxDevices = networkType === NetworkTypeEnum.CAPTIVEPORTAL &&
  // (guestPortal.guestNetworkType === GuestNetworkTypeEnum.SelfSignIn ||
  //   guestPortal.guestNetworkType === GuestNetworkTypeEnum.HostApproval);

  const { vlanPoolSelectOptions } = useVlanPoolListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        vlanPoolSelectOptions: data?.data?.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })

  return (
    <UI.CollpasePanel
      defaultActiveKey={['1', '2', '3']}
      expandIconPosition='end'
      ghost={true}
      bordered={false}
      style={{ width: '600px' }}>

      <Panel header='VLAN' key='1' >
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
              name={['wlan', 'vlanId']}
              label='VLAN ID'
              initialValue={1}
              style={{ marginBottom: '15px' }}
              children={<Input style={{ width: '66px' }}></Input>}
            />

            {showDynamicWlan &&
              <UI.FieldLabel width='auto' style={{ marginTop: '20px' }}>
                <UI.FormItemNoLabel
                  name={['wlan','advancedCustomization','dynamicVlan']}
                  style={{ marginBottom: '15px' , marginRight: '8px' }}
                  valuePropName='checked'
                  initialValue={true}
                  children={
                    <UI.CheckboxWrapper />
                  }
                />
              Dynamic VLAN
              </UI.FieldLabel>
            }

          </div>}
          {enableVlanPooling &&
        <div style={{ display: 'grid', gridTemplateColumns: '190px auto' }}>
          <Form.Item
            label='VLAN Pool:'
            name={['wlan', 'advancedCustomization', 'vlanPool']}
            style={{ marginBottom: '15px' }}
            children={
              <Select placeholder='Select profile...'
                style={{ width: '180px' }}
                children={vlanPoolSelectOptions} />
            }
          />
          <span style={{ marginTop: '30px' }}>Add</span>

        </div>
          }

          <UI.FieldLabel width='90px'>
        Proxy ARP:
            <Form.Item
              name={['wlan', 'advancedCustomization', 'enableProxyArp']}
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
          </UI.FieldLabel>
        </>
      </Panel>

      <Panel header='Services' key='2' >
        <ServicesForm />
      </Panel>

      <Panel header='Radio' key='3' >
        <UI.FormItemNoLabel
          name={['wlan','advancedCustomization','hideSsid']}
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
            name='bssMinRate'
            label='BSS Min Rate:'
            style={{ marginBottom: '15px' }}
            children={
              <BssMinRateSelect />
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
          name={['wlan','advancedCustomization','enableNeighborReport']}
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          initialValue={false}
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Enable 802.11k neighbor reports
            </UI.Label>}
        />

        {isFastBssVisible &&
          <UI.FormItemNoLabel
            name={['wlan', 'advancedCustomization', 'enableFastRoaming']}
            style={{ marginBottom: '15px' }}
            valuePropName='checked'
            initialValue={false}
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                Enable 802.11r Fast BSS Transition
              </UI.Label>}
          />
        }

        {enableFastRoaming &&
            <Form.Item
              name={['wlan','advancedCustomization','mobilityDomainId']}
              label='Mobility Domain ID'
              initialValue={1}
              style={{ marginBottom: '15px' }}
              children={<Input style={{ width: '150px' }}></Input>}
            />
        }

        <Form.Item
          name={['wlan','advancedCustomization','clientInactivityTimeout']}
          label='Client Inactivity Timeout:'
          initialValue={120}
          style={{ marginBottom: '15px' }}
          children={<Input style={{ width: '150px' }}></Input>}
        />

        <Form.Item
          name={['wlan','advancedCustomization','directedThreshold']}
          label='Directed MC/BC Threshold:'
          initialValue={5}
          style={{ marginBottom: '15px', width: '300px' }}
          extra={MessageEnum.DIRECTED_MCBC_THRESHOLD}
          children={<Input style={{ width: '150px' }}></Input>}
        />


        <UI.FieldLabel width='190px'>
          Airtime Decongestion:
          <Form.Item
            name={['wlan','advancedCustomization','enableAirtimedecongestion']}
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
                name={['wlan','advancedCustomization','enableJoinRSSIThreshold']}
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={false}
                children={<Switch />}
              />

              {enableJoinRSSIThreshold && <>
                <Form.Item
                  name={['wlan','advancedCustomization','joinRSSIThreshold']}
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
            name={['wlan','advancedCustomization','enableTransientClientManagement']}
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
                name={['wlan','advancedCustomization','joinWaitTime']}
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
                name={['wlan','advancedCustomization','joinExpireTime']}
                label='Join Expire Time:'
                style={{ marginBottom: '15px' }}
                initialValue={300}
                children={<Input style={{ width: '65px' }}></Input>}
              />

            </div>


            <Form.Item
              name={['wlan','advancedCustomization','joinWaitThreshold']}
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
            name={['wlan','advancedCustomization','enableOptimizedConnectivityExperience']}
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
                name={['wlan', 'advancedCustomization', 'broadcastProbeResponseDelay']}
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
                name={['wlan','advancedCustomization','rssiAssociationRejectionThreshold']}
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

function BssMinRateSelect () {
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

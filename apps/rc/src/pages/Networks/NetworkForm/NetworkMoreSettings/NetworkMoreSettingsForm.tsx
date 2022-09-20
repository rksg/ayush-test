import React, { useContext, useState, useEffect } from 'react'

import {
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Select,
  Switch
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { get }                 from 'lodash'
import { useIntl }             from 'react-intl'

import { Button }        from '@acx-ui/components'
import {
  useVlanPoolListQuery
} from '@acx-ui/rc/services'
import { NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { useParams }                                          from '@acx-ui/react-router-dom'


import NetworkFormContext from '../NetworkFormContext'

import { AccessControlForm } from './AccessControlForm'
import { LoadControlForm }   from './LoadControlForm'
import { ServicesForm }      from './ServicesForm'
import * as UI               from './styledComponents'

const { Panel } = Collapse

const { useWatch } = Form
const { Option } = Select

enum BssMinRateEnum {
  VALUE_NONE = 'default',
  VALUE_1 = '1',
  VALUE_2 = '2',
  VALUE_5_5 = '5.5',
  VALUE_12 = '12',
  VALUE_24 = '24'
}

enum MgmtTxRateEnum {
  VALUE_1 = '1',
  VALUE_2 = '2',
  VALUE_5_5 = '5.5',
  VALUE_6 = '6',
  VALUE_9 = '9',
  VALUE_11 = '11',
  VALUE_12 = '12',
  VALUE_18 = '18',
  VALUE_24 = '24'
}

const listPayload = {
  fields: ['name', 'id'], sortField: 'name',
  sortOrder: 'ASC', page: 1, pageSize: 10000
}

export function NetworkMoreSettingsForm (props: {
  wlanData: NetworkSaveData
}) {
  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        wlan: data.wlan,
        enableUploadLimit: data.wlan?.advancedCustomization?.userUplinkRateLimiting &&
          data.wlan?.advancedCustomization?.userUplinkRateLimiting > 0,
        enableDownloadLimit: data.wlan?.advancedCustomization?.userDownlinkRateLimiting &&
          data.wlan?.advancedCustomization?.userDownlinkRateLimiting > 0,
        enableOfdmOnly: get(data,
          'wlan.advancedCustomization.radioCustomization.phyTypeConstraint') === 'OFDM',
        managementFrameMinimumPhyRate: get(data,
          'wlan.advancedCustomization.radioCustomization.managementFrameMinimumPhyRate'),
        bssMinimumPhyRate: get(data,
          'wlan.advancedCustomization.radioCustomization.bssMinimumPhyRate')
      })
    }
  }, [data])
  const { $t } = useIntl()
  const [enableMoreSettings, setEnabled] = useState(false)
  if (data) {
    return <MoreSettingsForm wlanData={props.wlanData} />
  } else {
    return <div>
      <Button
        type='link'
        onClick={() => {
          setEnabled(!enableMoreSettings)
        }}
      >
        {enableMoreSettings ?
          $t({ defaultMessage: 'Show less settings' }) :
          $t({ defaultMessage: 'Show more settings' })}
      </Button>
      {enableMoreSettings &&
        <MoreSettingsForm wlanData={props.wlanData} />}
    </div>
  }
}


export function MoreSettingsForm (props: {
  wlanData: NetworkSaveData
}) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [
    enableOfdmOnly,
    enableFastRoaming,
    enableAirtimeDecongestion,
    enableJoinRSSIThreshold,
    enableTransientClientManagement,
    enableOce,
    enableVlanPooling,
    bssMinimumPhyRate //BSS Min Rate
  ] = [
    useWatch<boolean>('enableOfdmOnly'),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableFastRoaming']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableAirtimeDecongestion']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableJoinRSSIThreshold']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableTransientClientManagement']),
    useWatch<boolean>(['wlan', 'advancedCustomization',
      'enableOptimizedConnectivityExperience']),
    useWatch<boolean>('enableVlanPooling'),
    useWatch<string>('bssMinimumPhyRate')
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

  const onBbsMinRateChange = function (value: BssMinRateEnum) {
    if (value === BssMinRateEnum.VALUE_NONE) {
      form.setFieldsValue({
        managementFrameMinimumPhyRate: enableOfdmOnly ?
          MgmtTxRateEnum.VALUE_6 : MgmtTxRateEnum.VALUE_2
      })
    } else {
      form.setFieldsValue({
        managementFrameMinimumPhyRate: value
      })
    }
  }

  const onOfdmChange = function (e: CheckboxChangeEvent) {
    if (e.target.checked) {
      if (!(bssMinimumPhyRate === BssMinRateEnum.VALUE_12 ||
        bssMinimumPhyRate === BssMinRateEnum.VALUE_24)) {
        form.setFieldsValue({
          bssMinimumPhyRate: BssMinRateEnum.VALUE_NONE,
          managementFrameMinimumPhyRate: MgmtTxRateEnum.VALUE_6
        })
      }
    }

  }
  return (
    <UI.CollapsePanel
      defaultActiveKey={['1', '2', '3']}
      expandIconPosition='end'
      ghost={true}
      bordered={false}
      style={{ width: '100%', maxWidth: '600px' }}>

      <Panel header='VLAN' key='1' >
        <>
          <UI.FieldLabel width='90px'>
            { $t({ defaultMessage: 'VLAN Pooling:' }) }
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
              label={$t({ defaultMessage: 'VLAN ID' })}
              initialValue={1}
              rules={[
                { required: true }, {
                  type: 'number', max: 4094, min: 1,
                  message: $t({ defaultMessage: 'VLAN ID must be between 1 and 4094' })
                }]}
              style={{ marginBottom: '15px' }}
              children={<InputNumber style={{ width: '80px' }} />}
            />

            {showDynamicWlan &&
              <UI.FieldLabel width='auto' style={{ marginTop: '20px' }}>
                <UI.FormItemNoLabel
                  name={['wlan','advancedCustomization','dynamicVlan']}
                  style={{ marginBottom: '15px' , marginRight: '8px' }}
                  valuePropName='checked'
                  initialValue={true}
                  children={
                    <Checkbox children={$t({ defaultMessage: 'Dynamic VLAN' })} />
                  }
                />
              </UI.FieldLabel>
            }

          </div>}
          {enableVlanPooling &&
        <div style={{ display: 'grid', gridTemplateColumns: '190px auto' }}>
          <Form.Item
            label={$t({ defaultMessage: 'VLAN Pool:' })}
            name={['wlan', 'advancedCustomization', 'vlanPool']}
            style={{ marginBottom: '15px' }}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please select VLAN Pool profile' })
            }]}
            children={
              <Select placeholder={$t({ defaultMessage: 'Select profile...' })}
                style={{ width: '180px' }}
                children={vlanPoolSelectOptions} />
            }
          />
          <span style={{ marginTop: '30px' }}>{ $t({ defaultMessage: 'Add' }) }</span>

        </div>
          }

          <UI.FieldLabel width='90px'>
            { $t({ defaultMessage: 'Proxy ARP:' }) }
            <Form.Item
              name={['wlan', 'advancedCustomization', 'proxyARP']}
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
          initialValue={false}
          valuePropName='checked'
          children={
            <Checkbox children={$t({ defaultMessage: 'Hide SSID' })} />
          }
        />

        <UI.Subtitle>{$t({ defaultMessage: 'Load Control' })}</UI.Subtitle>
        <LoadControlForm />


        <AccessControlForm/>


        <UI.FormItemNoLabel
          name='enableOfdmOnly'
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          initialValue={false}
          children={
            <Checkbox
              onChange={onOfdmChange}
              children={$t({ defaultMessage: 'Enable OFDM only (disable 802.11b)' })} />
          }
        />

        <UI.Subtitle>
          {$t({ defaultMessage: 'Data Rate Control (2.4 GHz & 5 GHz)' })}
        </UI.Subtitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: '20px'
        }}>

          <Form.Item
            name='bssMinimumPhyRate'
            label={$t({ defaultMessage: 'BSS Min Rate:' })}
            style={{ marginBottom: '15px' }}
            children={
              <Select
                onChange={onBbsMinRateChange}
                defaultValue={BssMinRateEnum.VALUE_NONE}
                style={{ width: '150px' }}>
                <Option value={BssMinRateEnum.VALUE_NONE}>
                  {$t({ defaultMessage: 'None' })}
                </Option>
                {!enableOfdmOnly &&
                  <>
                    <Option value={BssMinRateEnum.VALUE_1}>
                      {$t({ defaultMessage: '1 Mbps' })}
                    </Option>
                    <Option value={BssMinRateEnum.VALUE_2}>
                      {$t({ defaultMessage: '2 Mbps' })}
                    </Option>
                    <Option value={BssMinRateEnum.VALUE_5_5}>
                      {$t({ defaultMessage: '5.5 Mbps' })}
                    </Option>
                  </>
                }
                <Option value={BssMinRateEnum.VALUE_12}>
                  {$t({ defaultMessage: '12 Mbps' })}
                </Option>
                <Option value={BssMinRateEnum.VALUE_24}>
                  {$t({ defaultMessage: '24 Mbps' })}
                </Option>
              </Select>
            } />

          <Form.Item
            name='managementFrameMinimumPhyRate'
            label={$t({ defaultMessage: 'Mgmt Tx Rate:' })}
            style={{ marginBottom: '15px' }}
            children={
              <Select
                disabled={enableOfdmOnly ||
                  (bssMinimumPhyRate !== BssMinRateEnum.VALUE_NONE)}
                defaultValue={MgmtTxRateEnum.VALUE_1}
                style={{ width: '150px' }}>
                <Option value={MgmtTxRateEnum.VALUE_1}>
                  {$t({ defaultMessage: '1 Mbps' })}
                </Option>
                <Option value={MgmtTxRateEnum.VALUE_2}>
                  {$t({ defaultMessage: '2 Mbps' })}
                </Option>
                <Option value={MgmtTxRateEnum.VALUE_5_5}>
                  {$t({ defaultMessage: '5.5 Mbps' })}
                </Option>
                <Option value={MgmtTxRateEnum.VALUE_6}>
                  {$t({ defaultMessage: '6 Mbps' })}
                </Option>
                <Option value={MgmtTxRateEnum.VALUE_9}>
                  {$t({ defaultMessage: '9 Mbps' })}
                </Option>
                <Option value={MgmtTxRateEnum.VALUE_11}>
                  {$t({ defaultMessage: '11 Mbps' })}
                </Option>
                <Option value={MgmtTxRateEnum.VALUE_12}>
                  {$t({ defaultMessage: '12 Mbps' })}
                </Option>
                <Option value={MgmtTxRateEnum.VALUE_18}>
                  {$t({ defaultMessage: '18 Mbps' })}
                </Option>
                <Option value={MgmtTxRateEnum.VALUE_24}>
                  {$t({ defaultMessage: '24 Mbps' })}
                </Option>
              </Select>
            } />
        </div>

        <UI.FormItemNoLabel
          name={['wlan','advancedCustomization','enableNeighborReport']}
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          initialValue={false}
          children={
            <Checkbox children={$t({ defaultMessage: 'Enable 802.11k neighbor reports' })} />
          }
        />

        {isFastBssVisible &&
          <UI.FormItemNoLabel
            name={['wlan', 'advancedCustomization', 'enableFastRoaming']}
            style={{ marginBottom: '15px' }}
            valuePropName='checked'
            initialValue={false}
            children={
              <Checkbox data-testid='enableFastRoaming'
                children={$t({ defaultMessage: 'Enable 802.11r Fast BSS Transition' })} />
            }
          />
        }

        {enableFastRoaming &&
            <Form.Item
              name={['wlan','advancedCustomization','mobilityDomainId']}
              label={$t({ defaultMessage: 'Mobility Domain ID' })}
              initialValue={1}
              style={{ marginBottom: '15px' }}
              children={<Input style={{ width: '150px' }}></Input>}
            />
        }

        <Form.Item
          name={['wlan','advancedCustomization','clientInactivityTimeout']}
          label={$t({ defaultMessage: 'Client Inactivity Timeout:' })}
          initialValue={120}
          style={{ marginBottom: '15px' }}
          children={<InputNumber style={{ width: '150px' }} />}
        />

        <Form.Item
          name={['wlan','advancedCustomization','directedThreshold']}
          label={$t({ defaultMessage: 'Directed MC/BC Threshold:' })}
          initialValue={5}
          style={{ marginBottom: '15px', width: '300px' }}
          extra={$t({ defaultMessage: `Per radio client count at which an AP will stop
          converting group addressed data traffic to unicast` })}
          children={<InputNumber style={{ width: '150px' }} />}
        />


        <UI.FieldLabel width='190px'>
          { $t({ defaultMessage: 'Airtime Decongestion:' }) }
          <Form.Item
            name={['wlan','advancedCustomization','enableAirtimeDecongestion']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>

        {!enableAirtimeDecongestion &&
          <UI.FieldLabel width='190px'>
            { $t({ defaultMessage: 'Join RSSI Threshold:' }) }
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
                { $t({ defaultMessage: 'dBm' }) }
              </>}
            </div>
          </UI.FieldLabel>
        }

        <UI.FieldLabel width='190px'>
          { $t({ defaultMessage: 'Transient Client Management:' }) }
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
                { $t({ defaultMessage: 'Seconds' }) }
              </UI.LabelOfInput>
              <Form.Item
                name={['wlan','advancedCustomization','joinWaitTime']}
                label={$t({ defaultMessage: 'Join Wait Time:' })}
                style={{ marginBottom: '15px' }}
                initialValue={30}
                children={<Input style={{ width: '65px' }}></Input>}
              />

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
              <UI.LabelOfInput>
                { $t({ defaultMessage: 'Seconds' }) }
              </UI.LabelOfInput>
              <Form.Item
                name={['wlan','advancedCustomization','joinExpireTime']}
                label={$t({ defaultMessage: 'Join Expire Time:' })}
                style={{ marginBottom: '15px' }}
                initialValue={300}
                children={<Input style={{ width: '65px' }}></Input>}
              />

            </div>


            <Form.Item
              name={['wlan','advancedCustomization','joinWaitThreshold']}
              label={$t({ defaultMessage: 'Join Wait Threshold:' })}
              style={{ marginBottom: '15px' }}
              initialValue={10}
              children={<Input style={{ width: '65px' }}></Input>}
            />
          </>

        }
        <UI.FieldLabel width='250px'>
          { $t({ defaultMessage: 'Optimized Connectivity Experience (OCE):' }) }
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
                { $t({ defaultMessage: 'ms' }) }
              </UI.LabelOfInput>
              <Form.Item
                name={['wlan', 'advancedCustomization', 'broadcastProbeResponseDelay']}
                label={$t({ defaultMessage: 'Broadcast Probe Response Delay:' })}
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
                { $t({ defaultMessage: 'dBm' }) }
              </UI.LabelOfInput>
              <Form.Item
                name={['wlan','advancedCustomization','rssiAssociationRejectionThreshold']}
                label={$t({ defaultMessage: 'RSSI-Based Association Rejection Threshold:' })}
                style={{ marginBottom: '15px' }}
                initialValue={-75}
                valuePropName='value'
              >
                <Input style={{ width: '65px', marginRight: '10px' }}></Input>
              </Form.Item>
            </div>
          </>}
      </Panel>
    </UI.CollapsePanel>
  )
}


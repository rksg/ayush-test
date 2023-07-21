import React, { useContext, useState, useEffect } from 'react'

import {
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  Space
} from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Tooltip }                                                                                       from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                from '@acx-ui/feature-toggle'
import { RadiusOptionsForm }                                                                                     from '@acx-ui/rc/components'
import { NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum, GuestNetworkTypeEnum, BasicServiceSetPriorityEnum } from '@acx-ui/rc/utils'
import { validationMessages }                                                                                    from '@acx-ui/utils'

import NetworkFormContext                                            from '../NetworkFormContext'
import { hasAccountingRadius, hasAuthRadius, hasVxLanTunnelProfile } from '../utils'
import VLANPoolInstance                                              from '../VLANPoolInstance'

import { AccessControlForm }  from './AccessControlForm'
import { LoadControlForm }    from './LoadControlForm'
import { ServicesForm }       from './ServicesForm'
import * as UI                from './styledComponents'
import { UserConnectionForm } from './UserConnectionForm'



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

export function NetworkMoreSettingsForm (props: {
  wlanData: NetworkSaveData | null
}) {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const wlanData = (editMode) ? props.wlanData : form.getFieldsValue()

  useEffect(() => {
    if ((editMode || cloneMode) && data) {
      form.setFieldsValue({
        wlan: {
          ...data.wlan,
          advancedCustomization: {
            ...data?.wlan?.advancedCustomization,
            vlanPool: get(data, 'wlan.advancedCustomization.vlanPool')
          }
        },
        enableUploadLimit: data.wlan?.advancedCustomization?.userUplinkRateLimiting &&
          data.wlan?.advancedCustomization?.userUplinkRateLimiting > 0,
        enableDownloadLimit: data.wlan?.advancedCustomization?.userDownlinkRateLimiting &&
          data.wlan?.advancedCustomization?.userDownlinkRateLimiting > 0,
        enableOfdmOnly: get(data,
          'wlan.advancedCustomization.radioCustomization.phyTypeConstraint') === 'OFDM',
        enableVlanPooling: get(data, 'wlan.advancedCustomization.vlanPool'),
        managementFrameMinimumPhyRate: get(data,
          'wlan.advancedCustomization.radioCustomization.managementFrameMinimumPhyRate'),
        bssMinimumPhyRate: get(data,
          'wlan.advancedCustomization.radioCustomization.bssMinimumPhyRate')
      })
    }
  }, [data, editMode, cloneMode])
  const { $t } = useIntl()

  /* Please be advised that why we use clone mode as state here
   * usually edit mode will show more setting in step form seperately
   * and clone mode just like usual adding network.
   * But when MoreSettingForm is not rendered (user didn't click
   * the show more button), the copied value in more setting will be
   * ignored.
   * In cause this scenario happen, MoreSettingsForm will auto expand
   * under clone mode, user can collapse manually, it will force React
   * to render MoreSettingsForm.
   * There should be no side effect when adding/editing a network.
   */
  const [enableMoreSettings, setEnabled] = useState(cloneMode)

  if (data && editMode) {
    return <MoreSettingsForm wlanData={wlanData} />
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
        <MoreSettingsForm wlanData={wlanData} />}
    </div>
  }
}


export function MoreSettingsForm (props: {
  wlanData: NetworkSaveData | null
}) {
  const { $t } = useIntl()
  const { editMode, data } = useContext(NetworkFormContext)
  const isRadiusOptionsSupport = useIsSplitOn(Features.RADIUS_OPTIONS)
  const AmbAndDtimFlag = useIsSplitOn(Features.WIFI_FR_6029_FG4_TOGGLE)
  const gtkRekeyFlag = useIsSplitOn(Features.WIFI_FR_6029_FG5_TOGGLE)
  const [
    enableDhcp,
    enableOfdmOnly,
    enableFastRoaming,
    enableAirtimeDecongestion,
    enableJoinRSSIThreshold,
    enableTransientClientManagement,
    enableOce,
    enableVlanPooling,
    bssMinimumPhyRate //BSS Min Rate
  ] = [
    useWatch<boolean>('enableDhcp'),
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

  const form = Form.useFormInstance()
  const wlanData = (editMode) ? props.wlanData : form.getFieldsValue()
  const enableWPA3_80211R = useIsSplitOn(Features.WPA3_80211R)
  const enableBSSPriority = useIsSplitOn(Features.WIFI_EDA_BSS_PRIORITY_TOGGLE)
  const multicastFilterFlag = useIsSplitOn(Features.WIFI_EDA_MULTICAST_FILTER_TOGGLE)
  const multicastFilterTooltipContent = (
    <div>
      <p>Drop all multicast or broadcast traffic from associated wireless clients,
        except for the following which is always allowed:</p>
      <ul style={{ paddingLeft: '40px' }}>
        <li>ARP request</li>
        <li>DHCPv4 request</li>
        <li>DHCPv6 request</li>
        <li>IPv6 NS</li>
        <li>IPv6 NA</li>
        <li>IPv6 RS</li>
        <li>IGMP</li>
        <li>MLD</li>
        <li>All unicast packets</li>
      </ul>
    </div>
  )
  const agileMultibandTooltipContent = (
    <div>
      <p>Agile Multiband prioritizes roaming performance in indoor environments,
          supporting protocols 802.11k, 802.11v, 802.11u, and 802.11r.</p>
    </div>
  )

  const isPortalDefaultVLANId = (data?.enableDhcp||enableDhcp) &&
    data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
    data.guestPortal?.guestNetworkType !== GuestNetworkTypeEnum.Cloudpath

  if (isPortalDefaultVLANId) {
    delete data?.wlan?.vlanId
    form.setFieldValue(['wlan', 'vlanId'], 3000)
  }

  let networkWPASecuredList = [
    WlanSecurityEnum.WPA2Personal,
    WlanSecurityEnum.WPAPersonal,
    WlanSecurityEnum.WPA2Enterprise]

  if (enableWPA3_80211R) {
    networkWPASecuredList = networkWPASecuredList.concat([
      WlanSecurityEnum.WPA23Mixed,
      WlanSecurityEnum.WPA3])
  }

  const isNetworkWPASecured = wlanData?.wlan?.wlanSecurity ?
    networkWPASecuredList.includes(wlanData?.wlan.wlanSecurity) : false

  const isFastBssVisible = data?.type === NetworkTypeEnum.AAA ? true : (
    data?.type !== NetworkTypeEnum.DPSK && isNetworkWPASecured )

  const showDynamicWlan = data?.type === NetworkTypeEnum.AAA ||
    data?.type === NetworkTypeEnum.DPSK

  const showRadiusOptions = isRadiusOptionsSupport && hasAuthRadius(data, wlanData)
  const showSingleSessionIdAccounting = hasAccountingRadius(data, wlanData)

  const enableVxLan = hasVxLanTunnelProfile(wlanData)

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

  const onOfdmChange = function (checked: boolean) {
    if (checked) {
      if (!(bssMinimumPhyRate === BssMinRateEnum.VALUE_12 ||
        bssMinimumPhyRate === BssMinRateEnum.VALUE_24)) {
        form.setFieldsValue({
          bssMinimumPhyRate: BssMinRateEnum.VALUE_NONE,
          managementFrameMinimumPhyRate: MgmtTxRateEnum.VALUE_6
        })
      }
    }

  }

  const UserConnectionComponent = () => {
    return (<UserConnectionForm />)
  }

  return (
    <UI.CollapsePanel
      defaultActiveKey={['1', '2', '3', '4', '5']}
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
              children={<Switch disabled={!useIsSplitOn(Features.POLICIES) || enableVxLan}/>}
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
                  message: $t(validationMessages.vlanRange)
                }]}
              style={{ marginBottom: '15px' }}
              children={<InputNumber style={{ width: '80px' }}
                disabled={isPortalDefaultVLANId || enableVxLan}/>}
            />

            {showDynamicWlan &&
              <UI.FieldLabel width='auto' style={{ marginTop: '20px' }}>
                <UI.FormItemNoLabel
                  name={['wlan','advancedCustomization','dynamicVlan']}
                  style={{ marginBottom: '15px' , marginRight: '8px' }}
                  valuePropName='checked'
                  initialValue={true}
                  children={
                    <Checkbox disabled={enableVxLan}
                      children={$t({ defaultMessage: 'Dynamic VLAN' })} />
                  }
                />
              </UI.FieldLabel>
            }

          </div>}

          {enableVxLan &&
            <Space size={1}>
              <UI.InfoIcon />
              <UI.Description>
                {
                  $t({
                    defaultMessage: `Not able to modify when the network
                    enables network segmentation service`
                  })
                }
              </UI.Description>
            </Space>
          }

          {enableVlanPooling &&
        <div style={{ display: 'grid', gridTemplateColumns: '190px auto' }}>
          <VLANPoolInstance/>
        </div>
          }

          <UI.FieldLabel width='90px'>
            { $t({ defaultMessage: 'Proxy ARP:' }) }
            <Form.Item
              name={['wlan', 'advancedCustomization', 'proxyARP']}
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch disabled={enableVxLan}/>}
            />
          </UI.FieldLabel>
        </>
      </Panel>

      <Panel header='Services' key='2' >
        <ServicesForm
          showSingleSessionIdAccounting={!isRadiusOptionsSupport && showSingleSessionIdAccounting}
        />
      </Panel>

      <Panel header='Radio' key='3' >
        <UI.FieldLabel width='125px'>
          {$t({ defaultMessage: 'Hide SSID' })}
          <Form.Item
            name={['wlan','advancedCustomization','hideSsid']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>

        <UI.Subtitle>{$t({ defaultMessage: 'Load Control' })}</UI.Subtitle>
        <LoadControlForm />


        <AccessControlForm/>

        <UI.FieldLabel width='250px'>
          {$t({ defaultMessage: 'Enable OFDM only (disable 802.11b)' })}
          <Form.Item
            name={['enableOfdmOnly']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={true}
            children={<Switch data-testid='enableOfdmOnly' onChange={onOfdmChange}></Switch>}
          />
        </UI.FieldLabel>

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
                data-testid='mgmtTxRateSelect'
                disabled={enableOfdmOnly ||
                  (bssMinimumPhyRate !== BssMinRateEnum.VALUE_NONE)}
                defaultValue={MgmtTxRateEnum.VALUE_6}
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

        {AmbAndDtimFlag &&
          <UI.FieldLabel width='250px'>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 80px auto' }}>
              {$t({ defaultMessage: 'Enable Agile Multiband (AMB)' })}
              <Tooltip.Question
                title={agileMultibandTooltipContent}
                placement='right'
              />
              <Form.Item
                name={['wlan', 'advancedCustomization', 'agileMultibandEnabled']}
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={false}
                children={<Switch/>}/>
            </div>
          </UI.FieldLabel>
        }

        <UI.FieldLabel width='250px'>
          {$t({ defaultMessage: 'Enable 802.11k neighbor reports' })}
          <Form.Item
            name={['wlan','advancedCustomization','enableNeighborReport']}
            style={{ marginBottom: '15px' }}
            valuePropName='checked'
            initialValue={true}
            children={<Switch />}
          />
        </UI.FieldLabel>

        {isFastBssVisible &&
          <UI.FieldLabel width='125px'>
            {$t({ defaultMessage: 'Enable 802.11r Fast BSS Transition' })}
            <Form.Item
              data-testid='enableFastRoaming-full-block'
              name={['wlan', 'advancedCustomization', 'enableFastRoaming']}
              style={{ marginBottom: '15px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch data-testid='enableFastRoaming' />}
            />
          </UI.FieldLabel>
        }

        {enableFastRoaming &&
            <Form.Item
              name={['wlan','advancedCustomization','mobilityDomainId']}
              label={$t({ defaultMessage: 'Mobility Domain ID' })}
              data-testid='mobilityDomainId-full-block'
              initialValue={1}
              rules={[
                {
                  type: 'number', max: 65535, min: 1, transform: Number,
                  message: $t({
                    defaultMessage: 'Mobility Domain ID must be between 1 and 65535'
                  })
                }
              ]}
              style={{ marginBottom: '15px' }}
              children={
                <Input data-testid='mobilityDomainId-input'
                  style={{ width: '150px' }}
                />}
            />
        }

        <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
          <UI.LabelOfInput style={{ left: '165px' }}>
            { $t({ defaultMessage: 'Seconds' }) }
          </UI.LabelOfInput>
          <Form.Item
            name={['wlan','advancedCustomization','clientInactivityTimeout']}
            label={$t({ defaultMessage: 'Client Inactivity Timeout:' })}
            initialValue={120}
            rules={[{
              type: 'number', max: 86400, min: 60,
              message: $t({
                defaultMessage: 'Client Inactivity Timeout must be between 60 and 86400'
              })
            }]}
            style={{ marginBottom: '15px' }}
            children={<InputNumber style={{ width: '150px' }} />}
          />
        </div>

        <Form.Item
          name={['wlan','advancedCustomization','directedThreshold']}
          label={$t({ defaultMessage: 'Directed MC/BC Threshold:' })}
          initialValue={5}
          rules={[{
            type: 'number', max: 5, min: 0,
            message: $t({
              defaultMessage: 'Directed MC/BC Threshold must be between 0 and 5'
            })
          }]}
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
                  rules={[{
                    type: 'number', max: -60, min: -90,
                    message: $t({
                      defaultMessage: 'Join RSSI Threshold must be between -90 and -60'
                    })
                  }]}
                  children={<InputNumber style={{ width: '65px' }} />}
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
                rules={[{
                  type: 'number', max: 60, min: 1,
                  message: $t({
                    defaultMessage: 'Join Wait Time must be between 1 and 60'
                  })
                }]}
                children={<InputNumber style={{ width: '65px' }} />}
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
                rules={[{
                  type: 'number', max: 300, min: 1,
                  message: $t({
                    defaultMessage: 'Join Expire Time must be between 1 and 300'
                  })
                }]}
                children={<InputNumber style={{ width: '65px' }} />}
              />

            </div>


            <Form.Item
              name={['wlan','advancedCustomization','joinWaitThreshold']}
              label={$t({ defaultMessage: 'Join Wait Threshold:' })}
              style={{ marginBottom: '15px' }}
              initialValue={10}
              rules={[{
                type: 'number', max: 50, min: 1,
                message: $t({
                  defaultMessage: 'Join Wait Threshold must be between 1 and 50'
                })
              }]}
              children={<InputNumber style={{ width: '65px' }} />}
            />
          </>

        }
        <UI.FieldLabel width='250px'>
          { $t({ defaultMessage: 'Optimized Connectivity Experience (OCE)' }) }
          <Form.Item
            name={['wlan','advancedCustomization','enableOptimizedConnectivityExperience']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>
        {gtkRekeyFlag &&
          <>
            <UI.FieldLabel width='250px'>
              {$t({ defaultMessage: 'AP Host Name Advertisement in Beacon' })}
              <Form.Item
                name={['wlan', 'advancedCustomization', 'enableApHostNameAdvertisement']}
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={false}
                children={<Switch/>}/>
            </UI.FieldLabel>
            <UI.FieldLabel width='250px'>
              {$t({ defaultMessage: 'GTK Rekey' })}
              <Form.Item
                name={['wlan', 'advancedCustomization', 'enableGtkRekey']}
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={true}
                children={<Switch/>}/>
            </UI.FieldLabel></>
        }

        {AmbAndDtimFlag &&
          <Form.Item
            name={['wlan','advancedCustomization','dtimInterval']}
            label={$t({ defaultMessage: 'DTIM (Delivery Traffic Indication Message) Interval' })}
            initialValue={1}
            rules={[{
              type: 'number', max: 255, min: 1,
              message: $t({
                defaultMessage:
                  'DTIM (Delivery Traffic Indication Message) Interval must be between 1 and 255'
              })
            }]}
            style={{ marginBottom: '15px', width: '300px' }}
            // eslint-disable-next-line max-len
            tooltip='Defines the frequency beacons will include a DTIM to wake clients in power-saving mode.'
            children={<InputNumber style={{ width: '150px' }} />}
          />
        }

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
                rules={[{
                  type: 'number', max: 120, min: 8,
                  message: $t({
                    defaultMessage: 'Broadcast Probe Response Delay must be between 8 and 120'
                  })
                }]}
                valuePropName='value'
                children={
                  <InputNumber style={{ width: '65px', marginRight: '10px' }} />
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
                rules={[{
                  type: 'number', max: -60, min: -90,
                  message: $t({
                    defaultMessage: 'RSSI-Based Association Rejection Threshold ' +
                      'must be between -90 and -60'
                  })
                }]}
                valuePropName='value'
                children={
                  <InputNumber style={{ width: '65px', marginRight: '10px' }} />
                }
              />
            </div>
          </>}

        {enableBSSPriority &&<>
          <UI.Subtitle>{$t({ defaultMessage: 'Basic Service Set' })}</UI.Subtitle>
          <Form.Item
            name={['wlan','advancedCustomization','bssPriority']}
            label={<>
              {$t({ defaultMessage: 'BSS Priority' })}
              <Tooltip.Question
              // eslint-disable-next-line max-len
                title={'LOW setting reduces the priority of the WLAN by limiting the throughput to all clients connected to this WLAN.\
               HIGH setting has no throughput limits. Default is WLAN priority set to HIGH.'}
                placement='right'
              />
            </>
            }
            initialValue={BasicServiceSetPriorityEnum.HIGH}
            valuePropName='value'
            style={{ marginBottom: '15px', width: '300px' }}
            children={
              <Radio.Group data-testid='BSS-Radio-Group'>
                <Space direction='vertical'>
                  <Radio value={BasicServiceSetPriorityEnum.HIGH} data-testid='BSS-Radio-HIGH'>
                    {$t({ defaultMessage: 'High' })}
                  </Radio>
                  <Radio value={BasicServiceSetPriorityEnum.LOW} data-testid='BSS-Radio-LOW'>
                    {$t({ defaultMessage: 'Low' })}
                  </Radio>
                </Space>
              </Radio.Group>
            }
          />
        </>
        }

        {multicastFilterFlag &&
          <UI.FieldLabel width='250px'>
            <div style={{ display: 'grid', gridTemplateColumns: '85px 100px auto' }}>
              {$t({ defaultMessage: 'Multicast Filter' })}
              <Tooltip.Question
              // eslint-disable-next-line max-len
                title={multicastFilterTooltipContent}
                placement='right'
              />
              <Form.Item
                name={['wlan', 'advancedCustomization', 'multicastFilterEnabled']}
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={false}
                children={<Switch
                  data-testid='multicast-filter-enabled'
                />}
              />
            </div>
          </UI.FieldLabel>
        }

      </Panel>
      {showRadiusOptions && <Panel header={$t({ defaultMessage: 'RADIUS Options' })} key='4'>
        <RadiusOptionsForm context='network'
          isWispr={data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr}
          showSingleSessionIdAccounting={showSingleSessionIdAccounting} />
      </Panel>
      }
      {data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&<Panel header='User Connection' key='5'>
        <UserConnectionComponent/>
      </Panel>}
    </UI.CollapsePanel>
  )
}


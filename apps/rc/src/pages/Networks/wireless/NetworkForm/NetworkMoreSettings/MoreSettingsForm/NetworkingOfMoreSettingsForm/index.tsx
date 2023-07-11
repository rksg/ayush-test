import React from 'react'

import { Form, Input, InputNumber, Radio, Space, Switch } from 'antd'
import { useIntl }                                        from 'react-intl'

import { Tooltip }                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn }                                                          from '@acx-ui/feature-toggle'
import { BasicServiceSetPriorityEnum, NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'

import * as UI from '../../styledComponents'


interface NetworkingOfMoreSettingsFormProps {
  wlanData: NetworkSaveData | null
  data: NetworkSaveData | null
  networkWPASecuredList: WlanSecurityEnum[]
  enableFastRoaming: boolean
  enableAirtimeDecongestion: boolean
  enableJoinRSSIThreshold: boolean
  enableTransientClientManagement: boolean
  enableOce: boolean
  enableBSSPriority: boolean
}
function NetworkingOfMoreSettingsForm (props: NetworkingOfMoreSettingsFormProps) {
  const { $t } = useIntl()
  const isNetworkWPASecured = props.wlanData?.wlan?.wlanSecurity ?
    props.networkWPASecuredList.includes(props.wlanData?.wlan.wlanSecurity) : false
  const isFastBssVisible = props.data?.type === NetworkTypeEnum.AAA ? true : (
    props.data?.type !== NetworkTypeEnum.DPSK && isNetworkWPASecured )
  const ssidRateLimitingFeatureBundleFlag = useIsSplitOn(Features.WIFI_FR_6029_FG4_TOGGLE)
  const gtkRekeyFlag = useIsSplitOn(Features.WIFI_FR_6029_FG5_TOGGLE)

  return (
    <>
      {ssidRateLimitingFeatureBundleFlag &&
        <UI.FieldLabel width='250px'>
          {$t({ defaultMessage: 'Enable Agile Multiband (AMB)' })}
          <Form.Item
            name={['wlan', 'advancedCustomization', 'agileMultibandEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch/>}/>
        </UI.FieldLabel>
      }
      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Enable 802.11k neighbor reports' })}
        <Form.Item
          name={['wlan', 'advancedCustomization', 'enableNeighborReport']}
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          initialValue={true}
          children={<Switch />}
        />
      </UI.FieldLabel>
      {isFastBssVisible && (
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
      )}

      {props.enableFastRoaming && (
        <Form.Item
          name={['wlan', 'advancedCustomization', 'mobilityDomainId']}
          label={$t({ defaultMessage: 'Mobility Domain ID' })}
          data-testid='mobilityDomainId-full-block'
          initialValue={1}
          rules={[
            {
              type: 'number',
              max: 65535,
              min: 1,
              transform: Number,
              message: $t({
                defaultMessage:
                  'Mobility Domain ID must be between 1 and 65535'
              })
            }
          ]}
          style={{ marginBottom: '15px' }}
          children={
            <Input
              data-testid='mobilityDomainId-input'
              style={{ width: '150px' }}
            />
          }
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
        <UI.LabelOfInput style={{ left: '165px' }}>
          {$t({ defaultMessage: 'Seconds' })}
        </UI.LabelOfInput>
        <Form.Item
          name={['wlan', 'advancedCustomization', 'clientInactivityTimeout']}
          label={$t({ defaultMessage: 'Client Inactivity Timeout:' })}
          initialValue={120}
          rules={[
            {
              type: 'number',
              max: 86400,
              min: 60,
              message: $t({
                defaultMessage:
                  'Client Inactivity Timeout must be between 60 and 86400'
              })
            }
          ]}
          style={{ marginBottom: '15px' }}
          children={<InputNumber style={{ width: '150px' }} />}
        />
      </div>

      <Form.Item
        name={['wlan', 'advancedCustomization', 'directedThreshold']}
        label={$t({ defaultMessage: 'Directed MC/BC Threshold:' })}
        initialValue={5}
        rules={[
          {
            type: 'number',
            max: 5,
            min: 0,
            message: $t({
              defaultMessage:
                'Directed MC/BC Threshold must be between 0 and 5'
            })
          }
        ]}
        style={{ marginBottom: '15px', width: '300px' }}
        extra={$t({
          defaultMessage: `Per radio client count at which an AP will stop
          converting group addressed data traffic to unicast`
        })}
        children={<InputNumber style={{ width: '150px' }} />}
      />

      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Airtime Decongestion:' })}
        <Form.Item
          name={['wlan', 'advancedCustomization', 'enableAirtimeDecongestion']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      {!props.enableAirtimeDecongestion && (
        <UI.FieldLabel width='250px'>
          {$t({ defaultMessage: 'Join RSSI Threshold:' })}
          <div
            style={{ display: 'grid', gridTemplateColumns: '50px 75px auto' }}
          >
            <Form.Item
              name={[
                'wlan',
                'advancedCustomization',
                'enableJoinRSSIThreshold'
              ]}
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />

            {props.enableJoinRSSIThreshold && (
              <>
                <Form.Item
                  name={['wlan', 'advancedCustomization', 'joinRSSIThreshold']}
                  style={{ marginBottom: '10px', lineHeight: '32px' }}
                  initialValue={-85}
                  rules={[
                    {
                      type: 'number',
                      max: -60,
                      min: -90,
                      message: $t({
                        defaultMessage:
                          'Join RSSI Threshold must be between -90 and -60'
                      })
                    }
                  ]}
                  children={<InputNumber style={{ width: '65px' }} />}
                />
                {$t({ defaultMessage: 'dBm' })}
              </>
            )}
          </div>
        </UI.FieldLabel>
      )}

      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Transient Client Management:' })}
        <Form.Item
          name={[
            'wlan',
            'advancedCustomization',
            'enableTransientClientManagement'
          ]}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>
      {props.enableTransientClientManagement && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
            <UI.LabelOfInput>
              {$t({ defaultMessage: 'Seconds' })}
            </UI.LabelOfInput>
            <Form.Item
              name={['wlan', 'advancedCustomization', 'joinWaitTime']}
              label={$t({ defaultMessage: 'Join Wait Time:' })}
              style={{ marginBottom: '15px' }}
              initialValue={30}
              rules={[
                {
                  type: 'number',
                  max: 60,
                  min: 1,
                  message: $t({
                    defaultMessage: 'Join Wait Time must be between 1 and 60'
                  })
                }
              ]}
              children={<InputNumber style={{ width: '65px' }} />}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
            <UI.LabelOfInput>
              {$t({ defaultMessage: 'Seconds' })}
            </UI.LabelOfInput>
            <Form.Item
              name={['wlan', 'advancedCustomization', 'joinExpireTime']}
              label={$t({ defaultMessage: 'Join Expire Time:' })}
              style={{ marginBottom: '15px' }}
              initialValue={300}
              rules={[
                {
                  type: 'number',
                  max: 300,
                  min: 1,
                  message: $t({
                    defaultMessage:
                      'Join Expire Time must be between 1 and 300'
                  })
                }
              ]}
              children={<InputNumber style={{ width: '65px' }} />}
            />
          </div>

          <Form.Item
            name={['wlan', 'advancedCustomization', 'joinWaitThreshold']}
            label={$t({ defaultMessage: 'Join Wait Threshold:' })}
            style={{ marginBottom: '15px' }}
            initialValue={10}
            rules={[
              {
                type: 'number',
                max: 50,
                min: 1,
                message: $t({
                  defaultMessage:
                    'Join Wait Threshold must be between 1 and 50'
                })
              }
            ]}
            children={<InputNumber style={{ width: '65px' }} />}
          />
        </>
      )}
      <UI.FieldLabel width='250px'>
        { $t({ defaultMessage: 'Optimized Connectivity Experience (OCE)' }) }
        <Form.Item
          name={[
            'wlan',
            'advancedCustomization',
            'enableOptimizedConnectivityExperience'
          ]}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      {props.enableOce && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
            <UI.LabelOfInput>{$t({ defaultMessage: 'ms' })}</UI.LabelOfInput>
            <Form.Item
              name={[
                'wlan',
                'advancedCustomization',
                'broadcastProbeResponseDelay'
              ]}
              label={$t({ defaultMessage: 'Broadcast Probe Response Delay:' })}
              style={{ marginBottom: '15px' }}
              initialValue={15}
              rules={[
                {
                  type: 'number',
                  max: 120,
                  min: 8,
                  message: $t({
                    defaultMessage:
                      'Broadcast Probe Response Delay must be between 8 and 120'
                  })
                }
              ]}
              valuePropName='value'
              children={
                <InputNumber style={{ width: '65px', marginRight: '10px' }} />
              }
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
            <UI.LabelOfInput>{$t({ defaultMessage: 'dBm' })}</UI.LabelOfInput>
            <Form.Item
              name={[
                'wlan',
                'advancedCustomization',
                'rssiAssociationRejectionThreshold'
              ]}
              label={$t({
                defaultMessage: 'RSSI-Based Association Rejection Threshold:'
              })}
              style={{ marginBottom: '15px' }}
              initialValue={-75}
              rules={[
                {
                  type: 'number',
                  max: -60,
                  min: -90,
                  message: $t({
                    defaultMessage:
                      'RSSI-Based Association Rejection Threshold ' +
                      'must be between -90 and -60'
                  })
                }
              ]}
              valuePropName='value'
              children={
                <InputNumber style={{ width: '65px', marginRight: '10px' }} />
              }
            />
          </div>
        </>
      )}
      {gtkRekeyFlag && <Multicast /> }
      {ssidRateLimitingFeatureBundleFlag &&
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
          children={<InputNumber style={{ width: '150px' }} />}
        />
      }
      {props.enableBSSPriority &&
        <div style={{ marginTop: '59px' }}>
          <BSSPriority/>
        </div>
      }
    </>
  )
}

function BSSPriority () {
  const { $t } = useIntl()

  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'Basic Service Set' })}
      </UI.Subtitle>
      <Form.Item
        name={['wlan', 'advancedCustomization', 'bssPriority']}
        label={
          <>
            {$t({ defaultMessage: 'BSS Priority' })}
            <Tooltip.Question
              // eslint-disable-next-line max-len
              title={
                // eslint-disable-next-line max-len
                'LOW setting reduces the priority of the WLAN by limiting the throughput to all clients connected to this WLAN.\
           HIGH setting has no throughput limits. Default is WLAN priority set to HIGH.'
              }
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
              <Radio
                value={BasicServiceSetPriorityEnum.HIGH}
                data-testid='BSS-Radio-HIGH'
              >
                {$t({ defaultMessage: 'High' })}
              </Radio>
              <Radio
                value={BasicServiceSetPriorityEnum.LOW}
                data-testid='BSS-Radio-LOW'
              >
                {$t({ defaultMessage: 'Low' })}
              </Radio>
            </Space>
          </Radio.Group>
        }
      />
    </>
  )
}

function Multicast () {
  const { $t } = useIntl()

  return (
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
          initialValue={false}
          children={<Switch/>}/>
      </UI.FieldLabel>
    </>
  )
}
export default NetworkingOfMoreSettingsForm
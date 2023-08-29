import { useContext, useEffect } from 'react'

import { Form, Input, InputNumber, Radio, Space, Switch } from 'antd'
import { useIntl, defineMessage }                         from 'react-intl'

import { Tooltip }                                                                                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                from '@acx-ui/feature-toggle'
import { RadiusOptionsForm }                                                                                     from '@acx-ui/rc/components'
import { BasicServiceSetPriorityEnum, GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'

import NetworkFormContext                     from '../../NetworkFormContext'
import { hasAccountingRadius, hasAuthRadius } from '../../utils'
import { MulticastForm }                      from '../MulticastForm'
import * as UI                                from '../styledComponents'

import WiFi7 from './WiFi7'

const { useWatch } = Form

export function NetworkingTab (props: { wlanData: NetworkSaveData | null }) {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)
  const { wlanData } = props
  const form = Form.useFormInstance()


  const labelWidth = '250px'

  const agileMultibandTooltipContent = $t({ defaultMessage:
    `Agile Multiband prioritizes roaming performance in indoor environments,
     supporting protocols 802.11k, 802.11v, 802.11u, and 802.11r.` })

  const ambFlag = useIsSplitOn(Features.WIFI_AMB_TOGGLE)
  const dtimFlag = useIsSplitOn(Features.WIFI_DTIM_TOGGLE)
  const gtkRekeyFlag = useIsSplitOn(Features.WIFI_FR_6029_FG5_TOGGLE)
  const enableWPA3_80211R = useIsSplitOn(Features.WPA3_80211R)
  const enableBSSPriority = useIsSplitOn(Features.WIFI_EDA_BSS_PRIORITY_TOGGLE)
  const isRadiusOptionsSupport = useIsSplitOn(Features.RADIUS_OPTIONS)

  const showRadiusOptions = isRadiusOptionsSupport && hasAuthRadius(data, wlanData)
  const showSingleSessionIdAccounting = hasAccountingRadius(data, wlanData)
  const wifi6AndWifi7Flag = useIsSplitOn(Features.WIFI_EDA_WIFI6_AND_WIFI7_FLAG_TOGGLE)
  const enable80211D = useIsSplitOn(Features.ADDITIONAL_REGULATORY_DOMAINS_TOGGLE)

  const [
    enableFastRoaming,
    enableAirtimeDecongestion,
    enableJoinRSSIThreshold,
    enableTransientClientManagement,
    enableOce
  ] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableFastRoaming']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableAirtimeDecongestion']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableJoinRSSIThreshold']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableTransientClientManagement']),
    useWatch<boolean>(['wlan', 'advancedCustomization',
      'enableOptimizedConnectivityExperience'])
  ]

  useEffect(() => {
    if(enableAirtimeDecongestion === true) {
      form.setFieldValue(['wlan', 'advancedCustomization', 'enableJoinRSSIThreshold'], false)
      form.setFieldValue(['wlan','advancedCustomization','joinRSSIThreshold'], undefined)
    }
  }, [enableAirtimeDecongestion, enableJoinRSSIThreshold])

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

  const additionalRegulatoryDomains80211dInfoMessage = defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage: '802.11d enables global compliance with additional regulatory domains. Enable this option if required in your locality.'
  })

  return (
    <>
      {ambFlag &&
        <UI.FieldLabel width={labelWidth}>
          <Space align='start'>
            {$t({ defaultMessage: 'Enable Agile Multiband (AMB)' })}
            <Tooltip.Question
              title={agileMultibandTooltipContent}
              placement='right'
              iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
            />
          </Space>
          <Form.Item
            name={['wlan', 'advancedCustomization', 'agileMultibandEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}/>
        </UI.FieldLabel>
      }

      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Enable 802.11k neighbor reports' })}
        <Form.Item
          name={['wlan','advancedCustomization','enableNeighborReport']}
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          initialValue={true}
          children={<Switch />}
        />
      </UI.FieldLabel>

      {enable80211D &&
      <UI.FieldLabel width={labelWidth}>
        <Space>
          {$t({ defaultMessage: 'Enable 802.11d' })}
          <Tooltip.Question
            title={$t(additionalRegulatoryDomains80211dInfoMessage)}
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          name={['wlan','advancedCustomization','enableAdditionalRegulatoryDomains']}
          style={{ marginBottom: '15px' }}
          valuePropName='checked'
          data-testid='enable-additional-regulatory-domains-80211d'
          initialValue={true}
          children={<Switch />}
        />
      </UI.FieldLabel>
      }

      {isFastBssVisible &&
        <UI.FieldLabel width={labelWidth}>
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

      <UI.FieldLabel width={labelWidth}>
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
        <UI.FieldLabel width={labelWidth}>
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

      <UI.FieldLabel width={labelWidth}>
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

      <UI.FieldLabel width={labelWidth}>
        { $t({ defaultMessage: 'Optimized Connectivity Experience (OCE)' }) }
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

      {gtkRekeyFlag &&
        <UI.FieldLabel width={labelWidth}>
          {$t({ defaultMessage: 'AP Host Name Advertisement in Beacon' })}
          <Form.Item
            name={['wlan', 'advancedCustomization', 'enableApHostNameAdvertisement']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch/>}/>
        </UI.FieldLabel>
      }

      {dtimFlag &&
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

      {gtkRekeyFlag &&
      <UI.FieldLabel width={labelWidth}>
        <Space>
          {$t({ defaultMessage: 'GTK Rekey' })}
          <Tooltip.Question
          // eslint-disable-next-line max-len
            title={$t({ defaultMessage: 'The periodic generation of a new group key for securing multicast/broadcast traffic' })}
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          name={['wlan', 'advancedCustomization', 'enableGtkRekey']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={true}
          children={<Switch/>}/>
      </UI.FieldLabel>
      }

      <MulticastForm/>

      {enableBSSPriority &&
      <>
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
          </>}
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
      </>}

      { wifi6AndWifi7Flag && <WiFi7 wlanData={wlanData} /> }

      {showRadiusOptions &&
      <>
        <UI.Subtitle>{$t({ defaultMessage: 'RADIUS Options' })}</UI.Subtitle>
        <RadiusOptionsForm context='network'
          isWispr={data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr}
          showSingleSessionIdAccounting={showSingleSessionIdAccounting} />
      </>}
    </>
  )
}

import { useContext, useEffect } from 'react'

import { Input, Space } from 'antd'
import {
  Col,
  Form,
  Row,
  Select,
  Switch
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  StepsFormLegacy,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { InformationSolid, QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  AAAWlanSecurityEnum,
  MacAuthMacFormatEnum,
  ManagementFrameProtectionEnum,
  WifiNetworkMessages,
  WlanSecurityEnum,
  macAuthMacFormatOptions
} from '@acx-ui/rc/utils'

import AAAInstance                 from '../AAAInstance'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }              from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

const { Option } = Select

const { useWatch } = Form

export function AaaSettingsForm () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  useEffect(()=>{
    if(data && (editMode || cloneMode)){

      form.setFieldsValue({
        enableAuthProxy: data.enableAuthProxy,
        enableAccountingProxy: data.enableAccountingProxy,
        enableAccountingService: data.enableAccountingService,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius,
        accountingRadiusId: data.accountingRadiusId,
        authRadiusId: data.authRadiusId,
        wlan: {
          wlanSecurity: data.wlan?.wlanSecurity,
          managementFrameProtection: data.wlan?.managementFrameProtection,
          macAddressAuthentication: data.wlan?.macAddressAuthentication,
          macAuthMacFormat: data.wlan?.macAuthMacFormat
        }
      })
    }
  }, [data])

  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
    {!(editMode) && <Row>
      <Col span={24}>
        <NetworkMoreSettingsForm wlanData={data} />
      </Col>
    </Row>}
  </>)
}

function SettingsForm () {
  const { $t } = useIntl()
  const { editMode, cloneMode } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
  const wlanSecurity = useWatch(['wlan', 'wlanSecurity'])
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)
  const wpa2Description = <FormattedMessage
    /* eslint-disable max-len */
    defaultMessage={`
      WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006.
      WPA2 should be selected unless you have a specific reason to choose otherwise.
      <highlight>
        6GHz radios are only supported with WPA3.
      </highlight>
    `}
    /* eslint-enable */
    values={{
      highlight: (chunks) => <Space align='start'>
        <InformationSolid />
        {chunks}
      </Space>
    }}
  />

  const wpa3Description = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.'
  })

  const form = Form.useFormInstance()
  useEffect(() => {
    if (!editMode && !cloneMode) {
      if (!wlanSecurity || !Object.keys(AAAWlanSecurityEnum).includes(wlanSecurity)) {
        form.setFieldValue(['wlan', 'wlanSecurity'], WlanSecurityEnum.WPA2Enterprise)
        // eslint-disable-next-line max-len
        form.setFieldValue(['wlan', 'managementFrameProtection'], ManagementFrameProtectionEnum.Disabled)
      }
    }

    if (wlanSecurity === WlanSecurityEnum.WPA3){
      disableMLO(false)
    } else {
      disableMLO(true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }

  }, [cloneMode, editMode, form, wlanSecurity])

  const handleWlanSecurityChanged = (v: WlanSecurityEnum) => {
    const managementFrameProtection = (v === WlanSecurityEnum.WPA3)
      ? ManagementFrameProtectionEnum.Required
      : ManagementFrameProtectionEnum.Disabled

    form.setFieldValue(['wlan', 'managementFrameProtection'], managementFrameProtection)
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsFormLegacy.Title>{ $t({ defaultMessage: 'AAA Settings' }) }</StepsFormLegacy.Title>
        {triBandRadioFeatureFlag &&
          <Form.Item
            label='Security Protocol'
            name={['wlan', 'wlanSecurity']}
            extra={
              wlanSecurity === WlanSecurityEnum.WPA2Enterprise
                ? wpa2Description
                : wpa3Description
            }
          >
            <Select onChange={handleWlanSecurityChanged}>
              <Option value={WlanSecurityEnum.WPA2Enterprise}>
                { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
              </Option>
              <Option value={WlanSecurityEnum.WPA3}>{ $t({ defaultMessage: 'WPA3' }) }</Option>
            </Select>
          </Form.Item>
        }
        <Form.Item name={['wlan', 'managementFrameProtection']} noStyle>
          <Input type='hidden' />
        </Form.Item>
      </div>
      <div>
        <AaaService />
      </div>
    </Space>
  )

  function AaaService () {
    const { $t } = useIntl()
    const { setData, data } = useContext(NetworkFormContext)
    const form = Form.useFormInstance()
    const enableAccountingService = useWatch('enableAccountingService', form)
    const enableMacAuthentication = useWatch<boolean>(['wlan', 'macAddressAuthentication'])
    const support8021xMacAuth = useIsSplitOn(Features.WIFI_8021X_MAC_AUTH_TOGGLE)
    const onProxyChange = (value: boolean, fieldName: string) => {
      setData && setData({ ...data, [fieldName]: value })
    }
    const onMacAuthChange = (checked: boolean) => {
      setData && setData({
        ...data,
        ...{
          wlan: {
            ...data?.wlan,
            macAddressAuthentication: checked
          }
        }
      })
    }

    const proxyServiceTooltip = <Tooltip
      placement='bottom'
      children={<QuestionMarkCircleOutlined />}
      title={$t({
        // eslint-disable-next-line max-len
        defaultMessage: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
      })}
    />
    const macAuthOptions = Object.keys(macAuthMacFormatOptions).map((key =>
      <Option key={key}>
        { macAuthMacFormatOptions[key as keyof typeof macAuthMacFormatOptions] }
      </Option>
    ))

    return (
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <div>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
            type='authRadius'/>
          <Form.Item>
            <Form.Item
              noStyle
              name='enableAuthProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch onChange={(value) => onProxyChange(value,'enableAuthProxy')}/>}
            />
            <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
            {proxyServiceTooltip}
          </Form.Item>
        </div>
        <div>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
          <Form.Item
            name='enableAccountingService'
            valuePropName='checked'
            initialValue={false}
            children={<Switch onChange={(value)=>onProxyChange(value,'enableAccountingService')}/>}
          />
          {enableAccountingService && (
            <>
              <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
                type='accountingRadius'/>
              <Form.Item>
                <Form.Item
                  noStyle
                  name='enableAccountingProxy'
                  valuePropName='checked'
                  initialValue={false}
                  children={<Switch
                    onChange={(value) => onProxyChange(value,'enableAccountingProxy')}/>}
                />
                <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
                {proxyServiceTooltip}
              </Form.Item>
            </>
          )}
        </div>
        {support8021xMacAuth &&
        <>
          <Form.Item>
            <Form.Item
              noStyle
              name={['wlan', 'macAddressAuthentication']}
              valuePropName='checked'>
              <Switch
                disabled={editMode}
                onChange={onMacAuthChange}
                data-testid='macAuth8021x'
              />
            </Form.Item>
            <span>{ $t({ defaultMessage: 'MAC Authentication' }) }</span>
            <Tooltip.Question
              title={$t(WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP)}
              placement='bottom'
              iconStyle={{ height: '16px', width: '16px' }}
            />
          </Form.Item>
          {enableMacAuthentication &&
            <Form.Item
              label={$t({ defaultMessage: 'MAC Address Format' })}
              name={['wlan', 'macAuthMacFormat']}
              initialValue={MacAuthMacFormatEnum.UpperDash}
            >
              <Select>
                {macAuthOptions}
              </Select>
            </Form.Item>
          }
        </>
        }
      </Space>
    )
  }
}

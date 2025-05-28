import React, { useContext, useEffect, useState } from 'react'

import { Radio, Space } from 'antd'
import {
  Col,
  Form,
  Row,
  Select,
  Switch
} from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import {
  StepsFormLegacy,
  Button,
  Subtitle,
  Tooltip,
  PasswordInput
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { InformationSolid }                         from '@acx-ui/icons'
import {
  ManagementFrameProtectionEnum,
  PskWlanSecurityEnum,
  SecurityOptionsDescription,
  SecurityOptionsPassphraseLabel,
  MacAuthMacFormatEnum,
  macAuthMacFormatOptions,
  trailingNorLeadingSpaces,
  WlanSecurityEnum,
  WifiNetworkMessages,
  hexRegExp,
  passphraseRegExp,
  generateHexKey, useConfigTemplate
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '../../ApCompatibility'
import { AAAInstance }             from '../AAAInstance'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }              from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import * as UI                     from '../styledComponents'

import MacRegistrationListComponent from './MacRegistrationListComponent'
import { IdentityGroup }            from './SharedComponent/IdentityGroup/IdentityGroup'

const { Option } = Select
const { useWatch } = Form
const labelWidth = '250px'

export function PskSettingsForm () {
  const { editMode, cloneMode, data, isRuckusAiMode } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  useEffect(()=>{
    if((editMode || cloneMode) && data && !form.isFieldsTouched()) {
      form.setFieldsValue({
        wlan: {
          passphrase: data.wlan?.passphrase,
          wepHexKey: data.wlan?.wepHexKey,
          saePassphrase: data.wlan?.saePassphrase,
          wlanSecurity: data.wlan?.wlanSecurity,
          managementFrameProtection: data.wlan?.managementFrameProtection,
          macAddressAuthentication: data.wlan?.macAddressAuthentication,
          macRegistrationListId: data.wlan?.macRegistrationListId,
          macAuthMacFormat: data.wlan?.macAuthMacFormat
        },
        enableAuthProxy: data.enableAuthProxy,
        enableAccountingProxy: data.enableAccountingProxy,
        enableAccountingService: data.enableAccountingService,
        enableSecondaryAuthServer: data.authRadius?.secondary !== undefined,
        enableSecondaryAcctServer: data.accountingRadius?.secondary !== undefined,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius,
        accountingRadiusId: data.accountingRadiusId,
        authRadiusId: data.authRadiusId
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
    {!(editMode) && !(isRuckusAiMode) && <Row>
      <Col span={24}>
        <NetworkMoreSettingsForm
          wlanData={data} />
      </Col>
    </Row>}
  </>)
}

function SettingsForm () {
  const { $t } = useIntl()
  const { editMode, cloneMode, data, setData } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
  const form = Form.useFormInstance()
  const { networkId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const [
    wlanSecurity,
    macAddressAuthentication,
    isMacRegistrationList,
    macRegistrationListId
  ] = [
    useWatch(['wlan', 'wlanSecurity']),
    useWatch<boolean>(['wlan', 'macAddressAuthentication']),
    useWatch(['wlan', 'isMacRegistrationList']),
    useWatch(['wlan', 'macRegistrationListId'])
  ]

  const securityDescription = () => {
    const wlanSecurity = form.getFieldValue([ 'wlan', 'wlanSecurity' ])
    const showWarningSecurity = [
      WlanSecurityEnum.WPA2Personal,
      WlanSecurityEnum.WPAPersonal,
      WlanSecurityEnum.WEP
    ]
    const showWarning = showWarningSecurity.indexOf(wlanSecurity) > -1
    return (<>
      {wlanSecurity in PskWlanSecurityEnum &&
        $t(SecurityOptionsDescription[wlanSecurity as keyof typeof PskWlanSecurityEnum])}
      {showWarning &&
          <Space align='start' size={2}>
            <InformationSolid />
            {$t(SecurityOptionsDescription.WPA2_DESCRIPTION_WARNING)}
          </Space>
      }
    </>)
  }
  const isDeprecateWep = useIsSplitOn(Features.WIFI_WLAN_DEPRECATE_WEP)
  // eslint-disable-next-line max-len
  const isWifiIdentityManagementEnable = useIsSplitOn(Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const securityOptions = Object.keys(PskWlanSecurityEnum).map((key =>
    <Option key={key} disabled={isDeprecateWep && key === 'WEP'}>
      {isDeprecateWep && key === 'WEP' ?
        `${PskWlanSecurityEnum[key as keyof typeof PskWlanSecurityEnum]} (Unsafe)`
        : PskWlanSecurityEnum[key as keyof typeof PskWlanSecurityEnum]}
    </Option>
  ))
  const frameOptions = Object.keys(ManagementFrameProtectionEnum).map((key =>
    <Option key={key}>
      { ManagementFrameProtectionEnum[key as keyof typeof ManagementFrameProtectionEnum] }
    </Option>
  ))
  const macAuthOptions = Object.keys(macAuthMacFormatOptions).map((key =>
    <Option key={key}>
      { macAuthMacFormatOptions[key as keyof typeof macAuthMacFormatOptions] }
    </Option>
  ))

  const onGenerateHexKey = () => {
    let hexKey = generateHexKey(26)
    form.setFieldsValue({ wlan: { wepHexKey: hexKey.substring(0, 26) } })
  }

  const securityOnChange = (value: string) => {
    const wlanProtocolConfig = {} as { [key: string]: string | undefined | null }
    switch(value){
      case WlanSecurityEnum.WPA2Personal:
        form.setFieldsValue({
          wlan: {
            managementFrameProtection: ManagementFrameProtectionEnum.Disabled
          }
        })
        wlanProtocolConfig.managementFrameProtection = ManagementFrameProtectionEnum.Disabled
        break
      case WlanSecurityEnum.WPA3:
        form.setFieldsValue({
          wlan: {
            managementFrameProtection: ManagementFrameProtectionEnum.Required
          }
        })
        wlanProtocolConfig.managementFrameProtection = ManagementFrameProtectionEnum.Required
        break
      case WlanSecurityEnum.WPA23Mixed:
        form.setFieldsValue({
          wlan: {
            managementFrameProtection: ManagementFrameProtectionEnum.Optional
          }
        })
        wlanProtocolConfig.managementFrameProtection = ManagementFrameProtectionEnum.Optional
        break
    }

    setData && setData({
      ...data,
      ...{
        wlan: {
          ...data?.wlan,
          wlanSecurity: value as WlanSecurityEnum,
          ...wlanProtocolConfig
        }
      }
    })
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

  useEffect(()=>{
    form.setFieldsValue(data)
    if (editMode && data) {
      form.setFieldsValue({
        wlan: {
          isMacRegistrationList: !!data.wlan?.macRegistrationListId,
          macAddressAuthentication: data.wlan?.macAddressAuthentication,
          macRegistrationListId: data.wlan?.macRegistrationListId
        }
      })
    }
  },[data])

  useEffect(() => {

    if(!wlanSecurity) {return}

    if (wlanSecurity === WlanSecurityEnum.WPA3 || wlanSecurity === WlanSecurityEnum.WPA23Mixed){
      disableMLO(false)
    } else {
      disableMLO(true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }
  }, [wlanSecurity])

  useEffect(() => {
    if (!editMode && !cloneMode) {
      if (!wlanSecurity || !Object.keys(PskWlanSecurityEnum).includes(wlanSecurity)) {
        form.setFieldValue(['wlan', 'wlanSecurity'], WlanSecurityEnum.WPA2Personal)
      }
    }
  }, [cloneMode, editMode, form, wlanSecurity])

  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
      <div>
        {wlanSecurity !== WlanSecurityEnum.WEP && wlanSecurity !== WlanSecurityEnum.WPA3 &&
            <Form.Item
              name={['wlan', 'passphrase']}
              label={
                SecurityOptionsPassphraseLabel[wlanSecurity as keyof typeof PskWlanSecurityEnum]
                ?? SecurityOptionsPassphraseLabel.WPA2Personal}
              rules={[
                { required: true, min: 8 },
                { max: 64 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => passphraseRegExp(value) }
              ]}
              validateFirst
              extra={$t({ defaultMessage: '8 characters minimum' })}
              children={<PasswordInput />}
            />
        }
        {wlanSecurity === 'WEP' && <>
          <Form.Item
            name={['wlan', 'wepHexKey']}
            label={SecurityOptionsPassphraseLabel[PskWlanSecurityEnum.WEP]}
            rules={[
              { required: true },
              { validator: (_, value) => hexRegExp(value) }
            ]}
            extra={$t({ defaultMessage: 'Must be 26 hex characters' })}
            children={<PasswordInput />}
          />
          <div style={{ position: 'absolute', top: '111px', right: '15px' }}>
            <Button type='link' onClick={onGenerateHexKey}>
              {$t({ defaultMessage: 'Generate' })}
            </Button>
          </div>
        </>}
        {[WlanSecurityEnum.WPA23Mixed, WlanSecurityEnum.WPA3].includes(wlanSecurity) &&
            <Form.Item
              name={['wlan', 'saePassphrase']}
              label={wlanSecurity === WlanSecurityEnum.WPA3
                ? $t({ defaultMessage: 'SAE Passphrase' })
                : $t({ defaultMessage: 'WPA3 SAE Passphrase' })
              }
              rules={[
                { required: true, min: 8 },
                { max: 64 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => passphraseRegExp(value) }
              ]}
              validateFirst
              extra={$t({ defaultMessage: '8 characters minimum' })}
              children={<PasswordInput />}
            />
        }
        <Form.Item
          label={$t({ defaultMessage: 'Security Protocol' })}
          name={['wlan', 'wlanSecurity']}
          initialValue={WlanSecurityEnum.WPA2Personal}
          extra={securityDescription()}
        >
          <Select onChange={securityOnChange}>
            {securityOptions}
          </Select>
        </Form.Item>
        {[WlanSecurityEnum.WPA2Personal, WlanSecurityEnum.WPA3, WlanSecurityEnum.WPA23Mixed]
          .includes(wlanSecurity) &&
            <Form.Item
              label={<>
                {$t({ defaultMessage: 'Management Frame Protection (802.11w)' })}
                <Tooltip.Question
                  title={<FormattedMessage
                    {...WifiNetworkMessages.NETWORK_MFP_TOOLTIP}
                    values={{
                      p: (text: string) => <p>{text}</p>,
                      ul: (text: string) => <ul>{text}</ul>,
                      li: (text: string) => <li>{text}</li>
                    }}
                  />}
                  placement='bottom' />
              </>}
              name={['wlan', 'managementFrameProtection']}
              initialValue={ManagementFrameProtectionEnum.Disabled}
            >
              <Select disabled={[
                WlanSecurityEnum.WPA3,
                WlanSecurityEnum.WPA23Mixed
              ].includes(wlanSecurity)}>
                {frameOptions}
              </Select>
            </Form.Item>
        }
      </div>
      <div>
        <UI.FieldLabel width={labelWidth}>
          <Space align='start'>
            { $t({ defaultMessage: 'MAC Authentication' }) }
            {!isR370UnsupportedFeatures && <Tooltip.Question
              title={$t(WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP)}
              placement='bottom'
              iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
            />}
            {isR370UnsupportedFeatures && <ApCompatibilityToolTip
              title={$t(WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP)}
              showDetailButton
              placement='bottom'
              onClick={() => setDrawerVisible(true)}
            />}
            {isR370UnsupportedFeatures &&
            <ApCompatibilityDrawer
              visible={drawerVisible}
              type={ApCompatibilityType.ALONE}
              networkId={networkId}
              featureNames={[InCompatibilityFeatures.MAC_AUTH]}
              onClose={() => setDrawerVisible(false)}
            />}
          </Space>
          <Form.Item
            name={['wlan', 'macAddressAuthentication']}
            valuePropName='checked'>
            <Switch disabled={editMode} onChange={onMacAuthChange} />
          </Form.Item>
        </UI.FieldLabel>
        {macAddressAuthentication && <>
          {!isTemplate && <Form.Item
            name={['wlan', 'isMacRegistrationList']}
            initialValue={!!macRegistrationListId}
          >
            <Radio.Group disabled={editMode}>
              <Space direction='vertical'>
                <Radio value={true}
                  disabled={!isCloudpathBetaEnabled}
                  children={$t({ defaultMessage: 'MAC Registration List' })}
                />
                <Radio value={false}
                  children={$t({ defaultMessage: 'External MAC Auth' })}
                />
              </Space>
            </Radio.Group>
          </Form.Item>}

          { isMacRegistrationList && <MacRegistrationListComponent
            inputName={['wlan']}
          />}

          { (isTemplate || !isMacRegistrationList) && <>
            <Form.Item
              label={$t({ defaultMessage: 'MAC Address Format' })}
              name={['wlan', 'macAuthMacFormat']}
              initialValue={MacAuthMacFormatEnum.UpperDash}
              children={<Select children={macAuthOptions} />}
            />
            <MACAuthService />
          </>}
        </>}
      </div>
      { ( isWifiIdentityManagementEnable &&
          !isMacRegistrationList &&
          !isTemplate ) &&
          <IdentityGroup comboWidth='200px' />}
    </Space>
  )
}


function MACAuthService () {
  const { $t } = useIntl()
  const { data, setData } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const enableAccountingService = useWatch<boolean>(['enableAccountingService'])

  useEffect(()=>{
    form.setFieldsValue(data)
  },[data])

  const onChange = (value: boolean) => {
    setData && setData({ ...data, enableAccountingService: value })
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Authentication Service' })}</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'
          excludeRadSec={true}/>
      </div>
      <div>
        <UI.FieldLabel width={labelWidth}>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
          <Form.Item
            name='enableAccountingService'
            valuePropName='checked'
            style={{ marginTop: '-5px', marginBottom: '0' }}
            children={<Switch onChange={onChange} />}
          />
        </UI.FieldLabel>
        {enableAccountingService &&
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'
            excludeRadSec={true}/>
        }
      </div>
    </Space>
  )
}

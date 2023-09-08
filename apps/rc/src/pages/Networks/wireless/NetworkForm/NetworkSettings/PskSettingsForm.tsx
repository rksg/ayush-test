import React, { useContext, useEffect } from 'react'

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
  generateHexKey
} from '@acx-ui/rc/utils'

import AAAInstance                 from '../AAAInstance'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import MacRegistrationListComponent from './MacRegistrationListComponent'

const { Option } = Select

const { useWatch } = Form

export function PskSettingsForm () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
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
    {!(editMode) && <Row>
      <Col span={24}>
        <NetworkMoreSettingsForm wlanData={data} />
      </Col>
    </Row>}
  </>)
}

function SettingsForm () {
  const { editMode, data, setData } = useContext(NetworkFormContext)
  const intl = useIntl()
  const form = Form.useFormInstance()
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
    return (
      <>
        {SecurityOptionsDescription[wlanSecurity as keyof typeof PskWlanSecurityEnum]}
        {[
          WlanSecurityEnum.WPA2Personal,
          WlanSecurityEnum.WPAPersonal,
          WlanSecurityEnum.WEP
        ].indexOf(wlanSecurity) > -1 &&
          <Space align='start' size={2}>
            <InformationSolid />
            {SecurityOptionsDescription.WPA2_DESCRIPTION_WARNING}
          </Space>
        }
      </>
    )
  }

  const securityOptions = Object.keys(PskWlanSecurityEnum).map((key =>
    <Option key={key}>{ PskWlanSecurityEnum[key as keyof typeof PskWlanSecurityEnum] }</Option>
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
    wlanProtocolConfig.macRegistrationListId = value !== WlanSecurityEnum.WPA2Personal
      ? null
      : data?.wlan?.macRegistrationListId
    wlanProtocolConfig.passphrase = value !== WlanSecurityEnum.WPA2Personal
      ? null
      : data?.wlan?.passphrase

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

  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const disablePolicies = !useIsSplitOn(Features.POLICIES)

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <StepsFormLegacy.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
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
              extra={intl.$t({ defaultMessage: '8 characters minimum' })}
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
            extra={intl.$t({ defaultMessage: 'Must be 26 hex characters' })}
            children={<PasswordInput />}
          />
          <div style={{ position: 'absolute', top: '111px', right: '15px' }}>
            <Button type='link' onClick={onGenerateHexKey}>
              {intl.$t({ defaultMessage: 'Generate' })}
            </Button>
          </div>
        </>}
        {[WlanSecurityEnum.WPA23Mixed, WlanSecurityEnum.WPA3].includes(wlanSecurity) &&
            <Form.Item
              name={['wlan', 'saePassphrase']}
              label={wlanSecurity === WlanSecurityEnum.WPA3
                ? intl.$t({ defaultMessage: 'SAE Passphrase' })
                : intl.$t({ defaultMessage: 'WPA3 SAE Passphrase' })
              }
              rules={[
                { required: true, min: 8 },
                { max: 64 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => passphraseRegExp(value) }
              ]}
              validateFirst
              extra={intl.$t({ defaultMessage: '8 characters minimum' })}
              children={<PasswordInput />}
            />
        }
        <Form.Item
          label={intl.$t({ defaultMessage: 'Security Protocol' })}
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
                {intl.$t({ defaultMessage: 'Management Frame Protection (802.11w)' })}
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
        <Form.Item>
          <Form.Item>
            <Form.Item noStyle
              name={['wlan', 'macAddressAuthentication']}
              valuePropName='checked'>
              <Switch disabled={
                editMode || disablePolicies
              }
              onChange={onMacAuthChange}
              />
            </Form.Item>
            <span>{intl.$t({ defaultMessage: 'MAC Authentication' })}</span>
            <Tooltip.Question
              title={intl.$t(WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP)}
              placement='bottom'
            />
          </Form.Item>
        </Form.Item>
        {macAddressAuthentication && <>
          <Form.Item
            name={['wlan', 'isMacRegistrationList']}
            initialValue={macRegistrationListId}
          >
            <Radio.Group disabled={editMode} defaultValue={!!macRegistrationListId}>
              <Space direction='vertical'>
                <Radio value={true}
                  disabled={
                    !isCloudpathBetaEnabled
                  }>
                  { intl.$t({ defaultMessage: 'MAC Registration List' }) }
                </Radio>
                <Radio value={false}>
                  { intl.$t({ defaultMessage: 'External MAC Auth' }) }
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          { isMacRegistrationList && <MacRegistrationListComponent
            inputName={['wlan']}
          />}

          { !isMacRegistrationList && <>
            <Form.Item
              label={intl.$t({ defaultMessage: 'MAC Address Format' })}
              name={['wlan', 'macAuthMacFormat']}
              initialValue={MacAuthMacFormatEnum.UpperDash}
            >
              <Select>
                {macAuthOptions}
              </Select>
            </Form.Item>
            <MACAuthService />
          </>}

        </>}
      </div>
    </Space>
  )
}


function MACAuthService () {
  const intl = useIntl()
  const { data, setData } = useContext(NetworkFormContext)
  const onChange = (value: boolean) => {
    setData && setData({ ...data, enableAccountingService: value })
  }
  const form = Form.useFormInstance()
  const [
    enableAccountingService
  ] = [
    useWatch<boolean>(['enableAccountingService'])
  ]
  useEffect(()=>{
    form.setFieldsValue(data)
  },[data])
  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Authentication Service' })}</Subtitle>
        <AAAInstance serverLabel={intl.$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
      </div>
      <div>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch onChange={onChange}/>
        </Form.Item>
        {enableAccountingService &&
          <AAAInstance serverLabel={intl.$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
        }
      </div>
    </Space>
  )
}

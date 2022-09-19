import React, { useContext, useEffect } from 'react'

import {
  QuestionCircleOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons'
import { Space } from 'antd'
import {
  Col,
  Form,
  Row,
  Select,
  Switch,
  Tooltip,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import {
  StepsForm,
  Button,
  Subtitle
} from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import {
  ManagementFrameProtectionEnum,
  PskWlanSecurityEnum,
  SecurityOptionsDescription,
  SecurityOptionsPassphraseLabel,
  MacAuthMacFormatEnum,
  macAuthMacFormatOptions,
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  trailingNorLeadingSpaces,
  NetworkTypeEnum,
  WlanSecurityEnum,
  WifiNetworkMessages,
  hexRegExp,
  passphraseRegExp,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { IpPortSecretForm }        from '../../../../components/IpPortSecretForm'
import { ToggleButton }            from '../../../../components/ToggleButton'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

const { Option } = Select

const { useWatch } = Form

export function PskSettingsForm (props: {
  saveState: NetworkSaveData
}) {
  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  useEffect(()=>{
    if(data){
      form.setFieldsValue({
        wlan: {
          passphrase: data.wlan?.passphrase,
          wepHexKey: data.wlan?.wepHexKey,
          saePassphrase: data.wlan?.saePassphrase,
          wlanSecurity: data.wlan?.wlanSecurity,
          managementFrameProtection: data.wlan?.managementFrameProtection,
          macAddressAuthentication: data.wlan?.macAddressAuthentication,
          macAuthMacFormat: data.wlan?.macAuthMacFormat
        },
        enableAuthProxy: data.enableAuthProxy,
        enableAccountingProxy: data.enableAccountingProxy,
        enableAccountingService: data.accountingRadius !== undefined,
        enableSecondaryAuthServer: data.authRadius?.secondary !== undefined,
        enableSecondaryAcctServer: data.accountingRadius?.secondary !== undefined,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius
      })
    }
  }, [data])
  const [
    selectedId,
    macAddressAuthentication
  ] = [
    useWatch('cloudpathServerId'),
    useWatch<boolean>(['wlan', 'macAddressAuthentication'])
  ]
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })

  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
        {!data && <NetworkMoreSettingsForm wlanData={props.saveState} />}
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram
          type={NetworkTypeEnum.PSK}
          cloudpathType={selected?.deploymentType}
          enableMACAuth={macAddressAuthentication}
        />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const { editMode } = useContext(NetworkFormContext)
  const intl = useIntl()
  const form = Form.useFormInstance()
  const [
    wlanSecurity,
    macAddressAuthentication
  ] = [
    useWatch(['wlan', 'wlanSecurity']),
    useWatch<boolean>(['wlan', 'macAddressAuthentication'])
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
          <Space align='start'>
            <ExclamationCircleFilled />
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
  const generateHexKey = () => {
    let hexKey = ''
    while (hexKey.length < 26) {
      hexKey += Math.random().toString(16).substring(2)
    }
    form.setFieldsValue({ wlan: { wepHexKey: hexKey.substring(0, 26) } })
  }
  const securityOnChange = (value: string) => {
    switch(value){
      case WlanSecurityEnum.WPA2Personal:
        form.setFieldsValue({
          wlan: {
            managementFrameProtection: ManagementFrameProtectionEnum.Disabled
          }
        })
        break
      case WlanSecurityEnum.WPA3:
        form.setFieldsValue({
          wlan: {
            managementFrameProtection: ManagementFrameProtectionEnum.Required
          }
        })
        break
      case WlanSecurityEnum.WPA23Mixed:
        form.setFieldsValue({
          wlan: {
            managementFrameProtection: ManagementFrameProtectionEnum.Optional
          }
        })
        break
    }
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <StepsForm.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
      <div>
        {wlanSecurity !== WlanSecurityEnum.WEP && wlanSecurity !== WlanSecurityEnum.WPA3 &&
          <Form.Item
            name={['wlan', 'passphrase']}
            label={SecurityOptionsPassphraseLabel[wlanSecurity as keyof typeof PskWlanSecurityEnum]
              ??SecurityOptionsPassphraseLabel.WPA2Personal}
            rules={[
              { required: true, min: 8 },
              { max: 64 },
              { validator: (_, value) => trailingNorLeadingSpaces(intl, value) },
              { validator: (_, value) => passphraseRegExp(intl, value) }
            ]}
            validateFirst
            extra={intl.$t({ defaultMessage: '8 characters minimum' })}
            children={<Input.Password />}
          />
        }
        {wlanSecurity === 'WEP' && <>
          <Form.Item
            name={['wlan', 'wepHexKey']}
            label={SecurityOptionsPassphraseLabel[PskWlanSecurityEnum.WEP]}
            rules={[
              { required: true },
              { validator: (_, value) => hexRegExp(intl, value) }
            ]}
            extra={intl.$t({ defaultMessage: 'Must be 26 hex characters' })}
            children={<Input.Password />}
          />
          <div style={{ position: 'absolute', top: '105px', right: '15px' }}>
            <Button type='link' onClick={generateHexKey}>
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
              { validator: (_, value) => trailingNorLeadingSpaces(intl, value) },
              { validator: (_, value) => passphraseRegExp(intl, value) }
            ]}
            validateFirst
            extra={intl.$t({ defaultMessage: '8 characters minimum' })}
            children={<Input.Password />}
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
          <Form.Item>
            <Space style={{
              display: 'grid',
              gridTemplateColumns: '100% 15px',
              position: 'relative', zIndex: 1 }}>
              <Form.Item
                label={intl.$t({ defaultMessage: 'Management Frame Protection (802.11w)' })}
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
              <Tooltip title={WifiNetworkMessages.NETWORK_MFP_TOOLTIP} placement='bottom'>
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          </Form.Item>
        }
      </div>
      <div>
        <Form.Item>
          <Form.Item>
            <Form.Item noStyle name={['wlan', 'macAddressAuthentication']} valuePropName='checked'>
              <Switch disabled={editMode} />
            </Form.Item>
            <span>{intl.$t({ defaultMessage: 'Use MAC Auth' })}</span>
            <Tooltip title={WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP} placement='bottom'>
              <QuestionCircleOutlined />
            </Tooltip>
          </Form.Item>
        </Form.Item>
        {macAddressAuthentication && <>
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
      </div>
    </Space>
  )
}


function MACAuthService () {
  const intl = useIntl()
  const [
    enableSecondaryAuthServer,
    enableAccountingService,
    enableSecondaryAcctServer
  ] = [
    useWatch<boolean>(['enableSecondaryAuthServer']),
    useWatch<boolean>(['enableAccountingService']),
    useWatch<boolean>(['enableSecondaryAcctServer'])
  ]
  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Authentication Service' })}</Subtitle>
        <IpPortSecretForm
          serverType={AaaServerTypeEnum.AUTHENTICATION}
          order={AaaServerOrderEnum.PRIMARY}
        />

        <Form.Item noStyle name='enableSecondaryAuthServer'>
          <ToggleButton
            enableText={intl.$t({ defaultMessage: 'Remove Secondary Server' })}
            disableText={intl.$t({ defaultMessage: 'Add Secondary Server' })}
          />
        </Form.Item>

        {enableSecondaryAuthServer &&
          <IpPortSecretForm
            serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.SECONDARY}
          />
        }
      </div>
      <div>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch />
        </Form.Item>

        {enableAccountingService && (<>
          <IpPortSecretForm
            serverType={AaaServerTypeEnum.ACCOUNTING}
            order={AaaServerOrderEnum.PRIMARY}
          />

          <Form.Item noStyle name='enableSecondaryAcctServer'>
            <ToggleButton
              enableText={intl.$t({ defaultMessage: 'Remove Secondary Server' })}
              disableText={intl.$t({ defaultMessage: 'Add Secondary Server' })}
            />
          </Form.Item>

          {enableSecondaryAcctServer &&
            <IpPortSecretForm
              serverType={AaaServerTypeEnum.ACCOUNTING}
              order={AaaServerOrderEnum.SECONDARY}
            />
          }
        </>)}
      </div>
    </Space>
  )
}

import React, { useState } from 'react'

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

import {
  StepsForm,
  StepFormProps,
  Button,
  Subtitle,
  ToggleButton
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
  CreateNetworkFormFields,
  hexRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { IpPortSecretForm } from '../../../components/ipPortSecretForm'
import { NetworkDiagram }   from '../NetworkDiagram/NetworkDiagram'

const { Option } = Select

const { useWatch } = Form

export function PskSettingsForm (props: StepFormProps<CreateNetworkFormFields>) {
  const [
    isCloudpathEnabled,
    selectedId,
    enableAuthProxy,
    enableAccountingService,
    enableAccountingProxy,
    macAddressAuthentication
  ] = [
    useWatch('isCloudpathEnabled'),
    useWatch('cloudpathServerId'),
    useWatch('enableAuthProxy'),
    useWatch('enableAccountingService'),
    useWatch('enableAccountingProxy'),
    useWatch('macAddressAuthentication')
  ]
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })
  const [enableAaaAuthBtn, setEnableAaaAuthBtn] = useState(true)
  const showButtons = enableAuthProxy !== !!enableAccountingProxy
                    && enableAccountingService && !isCloudpathEnabled

  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm formRef={props.formRef}/>
      </Col>
      <Col span={14}>
        <NetworkDiagram
          type={NetworkTypeEnum.PSK}
          cloudpathType={selected?.deploymentType}
          enableMACAuth={macAddressAuthentication}
        />
        {showButtons && <AaaButtons />}
      </Col>
    </Row>
  )

  function AaaButtons () {
    return (
      <Space align='center' style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type='link' disabled={enableAaaAuthBtn} onClick={() => setEnableAaaAuthBtn(true)}>
          Authentication Service
        </Button>
        <Button type='link' disabled={!enableAaaAuthBtn} onClick={() => setEnableAaaAuthBtn(false)}>
          Accounting Service
        </Button>
      </Space>
    )
  }
}

function SettingsForm (props: StepFormProps<CreateNetworkFormFields>) {
  const { formRef } = props
  const [
    wlanSecurity,
    enableSecondaryAuthServer,
    enableAccountingService,
    enableSecondaryAcctServer,
    macAddressAuthentication
  ] = [
    useWatch('wlanSecurity'),
    useWatch<boolean>('enableSecondaryAuthServer'),
    useWatch<boolean>('enableAccountingService'),
    useWatch<boolean>('enableSecondaryAcctServer'),
    useWatch<boolean>('macAddressAuthentication')
  ]

  const securityDescription = () => {
    const wlanSecurity = formRef?.current?.getFieldValue('wlanSecurity')
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
            {WifiNetworkMessages.WPA2_DESCRIPTION_WARNING}
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
    formRef?.current?.setFieldsValue({ wepHexKey: hexKey.substring(0, 26) })
  }
  const securityOnChange = (value: string) => {
    switch(value){
      case WlanSecurityEnum.WPA2Personal:
        formRef?.current?.setFieldsValue({ 
          managementFrameProtection: ManagementFrameProtectionEnum.Disabled
        })
        break
      case WlanSecurityEnum.WPA3:
        formRef?.current?.setFieldsValue({
          managementFrameProtection: ManagementFrameProtectionEnum.Required
        })
        break
      case WlanSecurityEnum.WPA23Mixed:
        formRef?.current?.setFieldsValue({
          managementFrameProtection: ManagementFrameProtectionEnum.Optional
        })
        break
    }
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <StepsForm.Title>Settings</StepsForm.Title>
      <div>
        {wlanSecurity !== WlanSecurityEnum.WEP && wlanSecurity !== WlanSecurityEnum.WPA3 &&
          <Form.Item
            name='passphrase'
            label={SecurityOptionsPassphraseLabel[wlanSecurity as keyof typeof PskWlanSecurityEnum]
              ??SecurityOptionsPassphraseLabel.WPA2Personal}
            rules={[{
              required: true,
              whitespace: false,
              min: 8
            },{
              validator: (_, value) => trailingNorLeadingSpaces(value)
            }]}
            extra={'8 characters minimum'}
            children={<Input.Password />}
          />
        }
        {wlanSecurity === 'WEP' &&
        <React.Fragment>
          <Form.Item
            name='wepHexKey'
            label={SecurityOptionsPassphraseLabel[PskWlanSecurityEnum.WEP]}
            rules={[{
              required: true,
              whitespace: false
            },{
              validator: (_, value) => hexRegExp(value)
            }]}
            extra={'Must be 26 hex characters'}
            children={<Input.Password />}
          />
          <div style={{ position: 'absolute', top: '105px', right: '15px' }}>
            <Button type='link' onClick={generateHexKey}>Generate</Button>
          </div>
        </React.Fragment>
        }
        {(wlanSecurity===WlanSecurityEnum.WPA23Mixed ||
          wlanSecurity===WlanSecurityEnum.WPA3) &&
          <Form.Item
            name='saePassphrase'
            label={wlanSecurity===WlanSecurityEnum.WPA3?'SAE Passphrase':'WPA3 SAE Passphrase'}
            rules={[{
              required: true,
              whitespace: false,
              min: 8
            },{
              validator: (_, value) => trailingNorLeadingSpaces(value)
            }]}
            extra='8 characters minimum'
            children={<Input.Password />}
          />
        }
        <Form.Item
          label='Security Protocol'
          name='wlanSecurity'
          initialValue={WlanSecurityEnum.WPA2Personal}
          extra={securityDescription()}
        >
          <Select onChange={securityOnChange}>
            {securityOptions}
          </Select>
        </Form.Item>
        { [WlanSecurityEnum.WPA2Personal, WlanSecurityEnum.WPA3, WlanSecurityEnum.WPA23Mixed]
          .indexOf(wlanSecurity) > -1 &&
          <Form.Item
            label='Management Frame Protection (802.11w)'
            name='managementFrameProtection'
            initialValue={ManagementFrameProtectionEnum.Disabled}
          >
            <Select 
              disabled={
                wlanSecurity === WlanSecurityEnum.WPA3 ||
                wlanSecurity === WlanSecurityEnum.WPA23Mixed
              }
            >
              {frameOptions}
            </Select>
          </Form.Item>
        }
      </div>
      <div>
        <Form.Item>
          <Form.Item>
            <Form.Item noStyle name='macAddressAuthentication' valuePropName='checked'>
              <Switch />
            </Form.Item>
            <span>Use MAC Auth</span>
            <Tooltip title={WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP} placement='bottom'>
              <QuestionCircleOutlined />
            </Tooltip>
          </Form.Item>
        </Form.Item>
        {macAddressAuthentication &&
          <React.Fragment>
            <Form.Item
              label='MAC Address Format'
              name='macAuthMacFormat'
              initialValue={MacAuthMacFormatEnum.UpperDash}
            >
              <Select>
                {macAuthOptions}
              </Select>
            </Form.Item>
            <MACAuthService />
          </React.Fragment>
        }
      </div>
    </Space>
  )

  function MACAuthService () {
    return (
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <div>
          <Subtitle level={3}>Authentication Service</Subtitle>
          <IpPortSecretForm
            serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.PRIMARY}
          />

          <Form.Item noStyle name='enableSecondaryAuthServer'>
            <ToggleButton
              enableText='Remove Secondary Server'
              disableText='Add Secondary Server'
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
          <Subtitle level={3}>Accounting Service</Subtitle>
          <Form.Item name='enableAccountingService' valuePropName='checked'>
            <Switch />
          </Form.Item>

          {enableAccountingService && (
            <>
              <IpPortSecretForm
                serverType={AaaServerTypeEnum.ACCOUNTING}
                order={AaaServerOrderEnum.PRIMARY}
              />

              <Form.Item noStyle name='enableSecondaryAcctServer'>
                <ToggleButton
                  enableText='Remove Secondary Server'
                  disableText='Add Secondary Server'
                />
              </Form.Item>

              {enableSecondaryAcctServer &&
                <IpPortSecretForm
                  serverType={AaaServerTypeEnum.ACCOUNTING}
                  order={AaaServerOrderEnum.SECONDARY}
                />
              }
            </>
          )}
        </div>
      </Space>
    )
  }
}
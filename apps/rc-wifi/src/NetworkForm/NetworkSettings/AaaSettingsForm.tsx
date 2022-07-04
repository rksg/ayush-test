import React, { useState } from 'react'

import {
  ExclamationCircleFilled,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Space } from 'antd'
import {
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Tooltip,
  Typography
} from 'antd'

import { StepsForm, Button }                        from '@acx-ui/components'
import { useGetAllUserSettingsQuery, UserSettings } from '@acx-ui/rc/services'
import { 
  Constants,
  WlanSecurityEnum,
  getUserSettingsFromDict,
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  AaaServerTitle,
  networkWifiIpRegExp,
  networkWifiPortRegExp,
  stringContainSpace
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

import { CloudpathServerForm } from './CloudpathServerForm'

const { Option } = Select

/* eslint-disable max-len */
const AaaMessages = {
  ENABLE_PROXY_TOOLTIP: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.',

  WPA2_DESCRIPTION: 'WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006. WPA2 should be selected unless you have a specific reason to choose otherwise.',

  WPA2_DESCRIPTION_WARNING: 'Security protocols other than WPA3 are not be supported in 6 GHz radio.',

  WPA3_DESCRIPTION: 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.'
}
/* eslint-enable */

const { useWatch } = Form

export function AaaSettingsForm () {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14}>
        <NetworkDiagram type='aaa' />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const [
    isCloudpathEnabled,
    wlanSecurity,
    enableSecondaryAuthServer,
    enableAccountingService,
    enableSecondaryAcctServer
  ] = [
    useWatch('isCloudpathEnabled'),
    useWatch('wlanSecurity'),
    useWatch('enableSecondaryAuthServer'),
    useWatch('enableAccountingService'),
    useWatch('enableSecondaryAcctServer')
  ]

  const { tenantId } = useParams()
  const userSetting = useGetAllUserSettingsQuery({ params: { tenantId } })
  const supportTriBandRadio = String(getUserSettingsFromDict(userSetting.data as UserSettings,
    Constants.triRadioUserSettingsKey)) === 'true'

  const wpa2Description = (
    <>
      {AaaMessages.WPA2_DESCRIPTION}
      <Space align='start'>
        <ExclamationCircleFilled />
        {AaaMessages.WPA2_DESCRIPTION_WARNING}
      </Space>
    </>
  )

  const wpa3Description = AaaMessages.WPA3_DESCRIPTION

  return (
    <>
      <StepsForm.Title>AAA Settings</StepsForm.Title>
      {supportTriBandRadio && 
        <Form.Item
          label='Security Protocol'
          name='wlanSecurity'
          initialValue={WlanSecurityEnum.WPA2Enterprise}
          extra={
            wlanSecurity === WlanSecurityEnum.WPA2Enterprise
              ? wpa2Description
              : wpa3Description
          }
        >
          <Select>
            <Option value={WlanSecurityEnum.WPA2Enterprise}>
              WPA2 (Recommended)
            </Option>
            <Option value={WlanSecurityEnum.WPA3}>WPA3</Option>
          </Select>
        </Form.Item>
      }
      <Form.Item>
        <Form.Item noStyle name='isCloudpathEnabled' valuePropName='checked'>
          <Switch />
        </Form.Item>
        <span>Use Cloudpath Server</span>
      </Form.Item>

      {isCloudpathEnabled ? <CloudpathServerForm /> : aaaService()}
    </>
  )

  function aaaService () {
    return (
      <React.Fragment>
        <StepsForm.Title>Authentication Service</StepsForm.Title>
        {getAaaServer(
          AaaServerTypeEnum.AUTHENTICATION,
          AaaServerOrderEnum.PRIMARY
        )}

        <Form.Item noStyle name='enableSecondaryAuthServer'>
          <ToggleButtonInput
            enableText='Remove Secondary Server'
            disableText='Add Secondary Server'
          />
        </Form.Item>

        {enableSecondaryAuthServer && getAaaServer(
          AaaServerTypeEnum.AUTHENTICATION,
          AaaServerOrderEnum.SECONDARY
        )}

        <Form.Item>
          <Form.Item
            noStyle
            name='enableAuthProxy'
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
          <span>Proxy Service</span>
          <Tooltip title={AaaMessages.ENABLE_PROXY_TOOLTIP} placement='bottom'>
            <QuestionCircleOutlined />
          </Tooltip>
        </Form.Item>

        <StepsForm.Title>Accounting Service</StepsForm.Title>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch />
        </Form.Item>

        {enableAccountingService && (
          <React.Fragment>
            {getAaaServer(
              AaaServerTypeEnum.ACCOUNTING,
              AaaServerOrderEnum.PRIMARY
            )}

            <Form.Item noStyle name='enableSecondaryAcctServer'>
              <ToggleButtonInput
                enableText='Remove Secondary Server'
                disableText='Add Secondary Server'
              />
            </Form.Item>

            {enableSecondaryAcctServer && getAaaServer(
              AaaServerTypeEnum.ACCOUNTING,
              AaaServerOrderEnum.SECONDARY
            )}

            <Form.Item>
              <Form.Item
                noStyle
                name='enableAccountingProxy'
                valuePropName='checked'
                initialValue={false}
                children={<Switch />}
              />
              <span>Proxy Service</span>
              <Tooltip title={AaaMessages.ENABLE_PROXY_TOOLTIP}>
                <QuestionCircleOutlined />
              </Tooltip>
            </Form.Item>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

function getAaaServer (
  serverType: AaaServerTypeEnum,
  order: AaaServerOrderEnum
) {
  const title = AaaServerTitle[order]
  return (
    <React.Fragment>
      <Typography.Title level={4} children={title} />
      <Form.Item
        name={`${serverType}.${order}.ip`}
        label='IP Address'
        rules={[{
          required: true,
          whitespace: false
        },{
          validator: networkWifiIpRegExp
        }]}
        children={<Input />}
      />
      <Form.Item
        name={`${serverType}.${order}.port`}
        label='Port'
        rules={[{
          required: true
        },{
          validator: networkWifiPortRegExp
        }]}
        children={<Input type='number'/>}
      />
      <Form.Item
        name={`${serverType}.${order}.sharedSecret`}
        label='Shared secret'
        rules={[{ 
          required: true,
          whitespace: false
        },{
          validator: stringContainSpace
        }]}
        children={<Input.Password />}
      />
    </React.Fragment>
  )
}

function ToggleButtonInput (props: {
  value?: boolean
  onChange?: (value: boolean) => void
  enableText: React.ReactNode
  disableText: React.ReactNode
}) {
  const [enabled, setEnabled] = useState(props.value ?? false)
  return <Button
    type='link'
    style={{ padding: 0 }}
    onClick={() => {
      props.onChange?.(!enabled)
      setEnabled(!enabled)
    }}
  >
    {enabled ? props.enableText : props.disableText}
  </Button>
}

import React, { useState } from 'react'

import {
  ExclamationCircleFilled,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Space } from 'antd'
import {
  Col,
  Form,
  Row,
  Select,
  Switch,
  Tooltip
} from 'antd'

import {
  StepsForm,
  Button,
  Subtitle,
  ToggleButtonInput
} from '@acx-ui/components'
import { useGetAllUserSettingsQuery, UserSettings } from '@acx-ui/rc/services'
import { useCloudpathListQuery }                    from '@acx-ui/rc/services'
import {
  Constants,
  WlanSecurityEnum,
  getUserSettingsFromDict,
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  IpPortSecretForm
} from '@acx-ui/rc/utils'
import { NetworkTypeEnum } from '@acx-ui/rc/utils'
import { useParams }       from '@acx-ui/react-router-dom'


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
  const [
    isCloudpathEnabled,
    selectedId,
    enableAuthProxy,
    enableAccountingService,
    enableAccountingProxy
  ] = [
    useWatch('isCloudpathEnabled'),
    useWatch('cloudpathServerId'),
    useWatch('enableAuthProxy'),
    useWatch('enableAccountingService'),
    useWatch('enableAccountingProxy')
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
        <SettingsForm />
      </Col>
      <Col span={14}>
        <NetworkDiagram
          type={NetworkTypeEnum.AAA}
          cloudpathType={selected?.deploymentType}
          enableAuthProxy={enableAuthProxy}
          enableAccountingProxy={enableAccountingProxy}
          enableAaaAuthBtn={enableAaaAuthBtn}
          showButtons={showButtons}
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
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
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
      </div>
      <div>
        {isCloudpathEnabled ? <CloudpathServerForm /> : <AaaService />}
      </div>
    </Space>
  )

  function AaaService () {
    return (
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <div>
          <Subtitle level={3}>Authentication Service</Subtitle>
          <IpPortSecretForm
            serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.PRIMARY}
          />

          <Form.Item noStyle name='enableSecondaryAuthServer'>
            <ToggleButtonInput
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
                <ToggleButtonInput
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
            </>
          )}
        </div>
      </Space>
    )
  }
}
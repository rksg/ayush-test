import React, { useContext, useState } from 'react'

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
import { FormattedMessage, useIntl } from 'react-intl'

import {
  StepsForm,
  Button,
  Subtitle
} from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { useSplitTreatment }           from '@acx-ui/feature-toggle'

import {
  WlanSecurityEnum,
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  NetworkTypeEnum
} from '@acx-ui/rc/utils'

import { useParams }       from '@acx-ui/react-router-dom'
import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext from '../NetworkFormContext'
import { IpPortSecretForm } from '../../../components/IpPortSecretForm'
import { ToggleButton }     from '../../../components/ToggleButton'
import { CloudpathServerForm } from './CloudpathServerForm'

const { Option } = Select

const { useWatch } = Form

export function AaaSettingsForm () {
  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  if(data){
    form.setFieldsValue({ 
      cloudpathServerId: data.cloudpathServerId,
      isCloudpathEnabled: data.cloudpathServerId !== undefined,
      wlanSecurity: data.wlan?.wlanSecurity,
      enableAuthProxy: data.enableAuthProxy,
      enableAccountingProxy: data.enableAccountingProxy,
      enableAccountingService: data.accountingRadius !== undefined,
      enableSecondaryAuthServer: data.authRadius?.secondary !== undefined,
      enableSecondaryAcctServer: data.accountingRadius?.secondary !== undefined
    })
  }
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
    const { $t } = useIntl()
    return (
      <Space align='center' style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type='link' disabled={enableAaaAuthBtn} onClick={() => setEnableAaaAuthBtn(true)}>
          { $t({ defaultMessage: 'Authentication Service' }) }
        </Button>
        <Button type='link' disabled={!enableAaaAuthBtn} onClick={() => setEnableAaaAuthBtn(false)}>
          { $t({ defaultMessage: 'Accounting Service' }) }
        </Button>
      </Space>
    )
  }
}

function SettingsForm () {
  const { $t } = useIntl()
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

  const triBandRadioFeatureFlag = useSplitTreatment('tri-band-radio-toggle') 
  const wpa2Description = <FormattedMessage
    /* eslint-disable max-len */
    defaultMessage={`
      WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006.
      WPA2 should be selected unless you have a specific reason to choose otherwise.
      <highlight>
        Security protocols other than WPA3 are not be supported in 6 GHz radio.
      </highlight>
    `}
    /* eslint-enable */
    values={{
      highlight: (chunks) => <Space align='start'>
        <ExclamationCircleFilled />
        {chunks}
      </Space>
    }}
  />

  const wpa3Description = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.'
  })

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsForm.Title>{ $t({ defaultMessage: 'AAA Settings' }) }</StepsForm.Title>
        {triBandRadioFeatureFlag &&
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
                { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
              </Option>
              <Option value={WlanSecurityEnum.WPA3}>{ $t({ defaultMessage: 'WPA3' }) }</Option>
            </Select>
          </Form.Item>
        }
        <Form.Item>
          <Form.Item noStyle name='isCloudpathEnabled' valuePropName='checked'>
            <Switch />
          </Form.Item>
          <span>{ $t({ defaultMessage: 'Use Cloudpath Server' }) }</span>
        </Form.Item>
      </div>
      <div>
        {isCloudpathEnabled ? <CloudpathServerForm /> : <AaaService />}
      </div>
    </Space>
  )

  function AaaService () {
    const { $t } = useIntl()
    const proxyServiceTooltip = <Tooltip
      placement='bottom'
      children={<QuestionCircleOutlined />}
      title={$t({
        // eslint-disable-next-line max-len
        defaultMessage: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
      })}
    />
    return (
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <div>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
          <IpPortSecretForm
            serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.PRIMARY}
          />

          <Form.Item noStyle name='enableSecondaryAuthServer'>
            <ToggleButton
              enableText={$t({ defaultMessage: 'Remove Secondary Server' })}
              disableText={$t({ defaultMessage: 'Add Secondary Server' })}
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
            <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
            {proxyServiceTooltip}
          </Form.Item>
        </div>
        <div>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
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
                  enableText={$t({ defaultMessage: 'Remove Secondary Server' })}
                  disableText={$t({ defaultMessage: 'Add Secondary Server' })}
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
                <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
                {proxyServiceTooltip}
              </Form.Item>
            </>
          )}
        </div>
      </Space>
    )
  }
}
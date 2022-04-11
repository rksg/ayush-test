import React, { useEffect, useState }                      from 'react'
import { ExclamationCircleFilled, QuestionCircleOutlined } from '@ant-design/icons'
import { Space }                                           from 'antd'
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Tooltip,
  Typography
} from 'antd'
import { StepsForm }             from 'src/components/StepsForm'
import { WlanSecurityEnum }      from 'src/utils/rc/constants'
import { useCloudpathListQuery } from '../../services'
import { NetworkDiagram }        from '../NetworkDiagram/NetworkDiagram'
const { Option } = Select

export interface AaaSettingsFields {
  wlanSecurity?: string;
  isCloudpathEnabled?: boolean;
  enableAuthProxy: boolean;
  enableAccountingProxy?: boolean;
  enableSecondaryAcctServer: boolean;
  enableSecondaryAuthServer: boolean;
  enableAccountingService: boolean;
}

enum AaaServerTypeEnum {
  AUTHENTICATION = 'authRadius',
  ACCOUNTING = 'accountingRadius'
}

enum AaaServerOrderEnum {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

enum AaaServerTitleEnum {
  PRIMARY = 'Primary Server',
  SECONDARY = 'Secondary Server'
}

enum MessageEnum {
  ENABLE_PROXY_TOOLTIP = `Use the controller as proxy in 802.1X networks.
  A proxy AAA server is used when APs send authentication/accounting messages
  to the controller and the controller forwards these messages to an external AAA server.`,

  WPA2_DESCRIPTION = `WPA2 is strong Wi-Fi security that is widely available on all mobile devices
  manufactured after 2006. WPA2 should be selected unless you have a specific
  reason to choose otherwise.`,

  WPA2_DESCRIPTION_WARNING = `Security protocols other than WPA3 are not be supported in 6 GHz
  radio.`,

  WPA3_DESCRIPTION = `WPA3 is the highest level of Wi-Fi security available but is supported only
  by devices manufactured after 2019.`
}


export function AaaSettingsForm () {
  return (
    <Row gutter={100}>
      <Col span={10}><SettingsForm /></Col>
      <Col span={10}><NetworkDiagram /></Col>
    </Row>
  )
}

function SettingsForm () {
  const [state, updateState] = useState<AaaSettingsFields>({
    wlanSecurity: WlanSecurityEnum.WPA2Enterprise,
    isCloudpathEnabled: false,
    enableAccountingProxy: false,
    enableAuthProxy: false,
    enableSecondaryAcctServer: false,
    enableSecondaryAuthServer: false,
    enableAccountingService: false
  })
  const updateData = (newData: Partial<AaaSettingsFields>) => {
    updateState({ ...state, ...newData })
  }

  const wpa2Description = (<>
    {MessageEnum.WPA2_DESCRIPTION}
    <Space align='start'>
      <ExclamationCircleFilled />
      {MessageEnum.WPA2_DESCRIPTION_WARNING}
    </Space>
  </>)

  const wpa3Description = MessageEnum.WPA3_DESCRIPTION

  return (<>
    <StepsForm.Title>AAA Settings</StepsForm.Title>
    <Form.Item
      label='Security Protocol'
      name='wlanSecurity'
      initialValue={WlanSecurityEnum.WPA2Enterprise}
      extra={(state.wlanSecurity === WlanSecurityEnum.WPA2Enterprise) ?
        wpa2Description : wpa3Description}
    >
      <Select
        onChange={function (value: any) {
          updateData({ wlanSecurity: value })
        }}>
        <Option value={WlanSecurityEnum.WPA2Enterprise}>WPA2 (Recommended)</Option>
        <Option value={WlanSecurityEnum.WPA3}>WPA3</Option>
      </Select>
    </Form.Item>

    <Form.Item name='isCloudpathEnabled' valuePropName='checked'>
      <Switch onChange={function (value: any) {
        updateData({ isCloudpathEnabled: value })
      }} />
      <span>Use Cloudpath Server</span>
    </Form.Item>
    {state.isCloudpathEnabled ? <CloudpathServer/> : aaaService()}
  </>)


  function aaaService () {
    return (
      <React.Fragment>
        <StepsForm.Title>Authentication Service</StepsForm.Title>
        {getAaaServer(AaaServerTypeEnum.AUTHENTICATION, AaaServerOrderEnum.PRIMARY)}
        <Button type='link'
          style={{ padding: 0 }}
          onClick={function () {
            updateData({ enableSecondaryAuthServer: !state.enableSecondaryAuthServer })}}>
          {state.enableSecondaryAuthServer ?
            'Remove Secondary Server' : 'Add Secondary Server'}
        </Button>

        {state.enableSecondaryAuthServer &&
        getAaaServer(AaaServerTypeEnum.AUTHENTICATION, AaaServerOrderEnum.SECONDARY)}

        <Form.Item name='enableAuthProxy' valuePropName='checked' initialValue='false'>
          <Switch onChange={function (value: any) {
            updateData({ enableAuthProxy: value })
          }} />
          <span>Proxy Service</span>
          <Tooltip title={MessageEnum.ENABLE_PROXY_TOOLTIP} placement='bottom'>
            <QuestionCircleOutlined />
          </Tooltip>
        </Form.Item>


        <StepsForm.Title>Accounting Service</StepsForm.Title>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch onChange={function (value: any) {
            updateData({ enableAccountingService: value })
          }} />
        </Form.Item>


        {state.enableAccountingService &&
          <React.Fragment>
            {getAaaServer(AaaServerTypeEnum.ACCOUNTING, AaaServerOrderEnum.PRIMARY)}

            <Button type='link'
              style={{ padding: 0 }}
              onClick={function () {
                updateData({ enableSecondaryAcctServer: !state.enableSecondaryAcctServer })
              }}>{state.enableSecondaryAcctServer ?
                'Remove Secondary Server' : 'Add Secondary Server'}
            </Button>
            {state.enableSecondaryAcctServer &&
            getAaaServer(AaaServerTypeEnum.ACCOUNTING, AaaServerOrderEnum.SECONDARY)}

            <Form.Item
              name='enableAccountingProxy'
              valuePropName='checked'
              initialValue='false'>
              <Switch onChange={function (value: any) {
                updateData({ enableAccountingProxy: value })
              }} />
              <span>Proxy Service</span>
              <Tooltip title={MessageEnum.ENABLE_PROXY_TOOLTIP}>
                <QuestionCircleOutlined />
              </Tooltip>
            </Form.Item>
          </React.Fragment>}

      </React.Fragment>
    )
  }
}

function CloudpathServer () {
  const { data, refetch } = useCloudpathListQuery({})

  useEffect(refetch, [data, refetch])

  const [state, updateState] = useState({
    enableCloudPathServer: false,
    cloudpathId: ''
  })

  const updateData = (newData: any) => {
    updateState(newData)
  }

  const selectOptions = []
  for (let i = 0; i < (data ? data.length : 0); i++) {
    selectOptions.push(<Option key={data[i].id}>{data[i].name}</Option>)
  }

  const onCloudPathChange = function (cloudpathId: any) {
    updateData({ enableCloudPathServer: true, cloudpathId })
  }

  const getCloudData = function () {
    return data.find((item: any) => item.id === state.cloudpathId)
  }

  return (
    <React.Fragment>
      <StepsForm.Title>Cloudpath Server</StepsForm.Title>
      <Form.Item
        name='cloudpathServerId'
        rules={[{ required: true }]}>
        <Select style={{ width: '100%' }}
          onChange={onCloudPathChange}
          placeholder='Select...'>
          {selectOptions}
        </Select>
      </Form.Item>

      {state.enableCloudPathServer &&
        (<>
          <Typography.Title level={4}>Radius Authentication Service</Typography.Title>
          <Form.Item
            label='Deployment Type'
            children={getCloudData().deploymentType} />
          <Typography.Title level={4}>Radius Authentication Service</Typography.Title>
          <Form.Item
            label='IP Address'
            children={getCloudData().authRadius.primary.ip +
              ':' + getCloudData().authRadius.primary.port} />
          <Form.Item
            label='Radius Shared secret'
            children={
              <Input.Password readOnly={true}
                bordered={false}
                style={{ padding: '0px' }}
                value={getCloudData().authRadius.primary.sharedSecret} />}
          />
        </>)
      }
    </React.Fragment>
  )
}

function getAaaServer (serverType: AaaServerTypeEnum, order: AaaServerOrderEnum) {
  return (
    <React.Fragment>
      <Typography.Title level={4}>
        {(order === AaaServerOrderEnum.PRIMARY && AaaServerTitleEnum.PRIMARY)
          || (order === AaaServerOrderEnum.SECONDARY && AaaServerTitleEnum.SECONDARY)}
      </Typography.Title>
      <Form.Item
        name={`${serverType}.${order}.ip`}
        label='IP Address'
        rules={[{ required: true }]}
        children={<Input />}
      />
      <Form.Item
        name={`${serverType}.${order}.port`}
        label='Port'
        rules={[{ required: true }]}
        children={<Input />} />
      <Form.Item
        name={`${serverType}.${order}.sharedSecret`}
        label='Shared secret'
        rules={[{ required: true }]}
        children={<Input.Password />} />
    </React.Fragment>)
}

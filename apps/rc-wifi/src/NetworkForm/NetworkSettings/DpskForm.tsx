import React, { useState } from 'react'

import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Radio, RadioChangeEvent, Space } from 'antd'
import {
  Col,
  Form,
  Input,
  Row,
  Select,
  Tooltip
} from 'antd'

import { StepsForm, Button }                       from '@acx-ui/components'
import { WlanSecurityEnum, NetworkTypeEnum, PassphraseFormatEnum, DpskNetworkType, 
  transformDpskNetwork, PassphraseExpirationEnum }      from '@acx-ui/rc/utils'

import { NetworkDiagram }    from '../NetworkDiagram/NetworkDiagram'
import { FieldExtraTooltip } from '../styledComponents'

import { CloudpathServerForm } from './CloudpathServerForm'

const { Option } = Select

export interface DpskSettingsFields {
  wlanSecurity?: string;
  isCloudpathEnabled?: boolean;
  passphraseFormat?: string;
  expiration?: string;
  passphraseLength?: number;
  cloudpathServerId?: string;
}

enum MessageEnum {
  WPA2_DESCRIPTION = `WPA2 is strong Wi-Fi security that is widely available on all mobile devices
  manufactured after 2006. WPA2 should be selected unless you have a specific
  reason to choose otherwise.`,

  WPA3_DESCRIPTION = `WPA3 is the highest level of Wi-Fi security available but is supported only
  by devices manufactured after 2019.`,
}

export function DpskForm () {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={NetworkTypeEnum.DPSK} />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const [state, updateState] = useState<DpskSettingsFields>({
    wlanSecurity: WlanSecurityEnum.WPA2Enterprise,
    isCloudpathEnabled: false
  })
  const updateData = (newData: Partial<DpskSettingsFields>) => {
    updateState({ ...state, ...newData })
  }

  const wpa2Description = (
    <>
      {MessageEnum.WPA2_DESCRIPTION}
    </>
  )

  const wpa3Description = MessageEnum.WPA3_DESCRIPTION

  const onChange = (e: RadioChangeEvent) => {
    updateData({ isCloudpathEnabled: e.target.value })
  }

  return (
    <>
      <StepsForm.Title>DPSK Settings</StepsForm.Title>
      <Form.Item
        label='Security Protocol'
        name='wlanSecurity'
        initialValue={WlanSecurityEnum.WPA2Enterprise}
        extra={
          state.wlanSecurity === WlanSecurityEnum.WPA2Enterprise
            ? wpa2Description
            : wpa3Description
        }
      >
        <Select
          onChange={function (value: any) {
            updateData({ wlanSecurity: value })
          }}
        >
          <Option value={WlanSecurityEnum.WPA2Enterprise}>
            WPA2 (Recommended)
          </Option>
          <Option value={WlanSecurityEnum.WPA3}>WPA3</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name='isCloudpathEnabled'
        initialValue={state.isCloudpathEnabled}
      >
        <Radio.Group onChange={onChange}>
          <Space direction='vertical'>
            <Radio value={false}>
                Use the DPSK Service
            </Radio>
            <Radio value={true}>
                Use Cloudpath Server
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      {state.isCloudpathEnabled ? <CloudpathServerForm /> : <PassphraseGeneration />}
      <div><Button type='link' style={{ padding: 0 }}>Show more settings</Button></div>
    </>
  )
}

function PassphraseGeneration () {
  const [state, updateState] = useState({
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18,
    expiration: PassphraseExpirationEnum.UNLIMITED
  })

  const updateData = (newData: any) => {
    updateState({ ...state, ...newData })
  }
  
  const passphraseOptions = Object.keys(PassphraseFormatEnum).map((key =>  
    <Option key={key}>{transformDpskNetwork(DpskNetworkType.FORMAT, key)}</Option>
  ))

  const expirationOptions = Object.keys(PassphraseExpirationEnum).map((key =>  
    <Option key={key}>{transformDpskNetwork(DpskNetworkType.EXPIRATION, key)}</Option>
  ))

  const onFormatChange = function (passphraseFormat: PassphraseFormatEnum) {
    updateData({ passphraseFormat })
  }

  const onExpirationChange = function (expiration: PassphraseExpirationEnum) {
    updateData({ expiration })
  }

  const passphraseFormatDescription = {
    [PassphraseFormatEnum.MOST_SECURED]: 'Letters, numbers and symbols can be used',
    [PassphraseFormatEnum.KEYBOARD_FRIENDLY]: 'Only letters and numbers can be used',
    [PassphraseFormatEnum.NUMBERS_ONLY]: 'Only numbers can be used'
  }

  const FIELD_TOOLTIP = {
    FORMAT: `<p> Format options: </p>
    <p> Most secured - all printable ASCII characters can be used </p>
    <p> Keyboard friendly - only letters and numbers will be used </p>
    Numbers only - only numbers will be used`,
  
    LENGTH: 'Number of characters in passphrase. Valid range 8-63'
  }
  

  return (
    <React.Fragment>
      <StepsForm.Title>Passphrase Generation Parameters</StepsForm.Title>
      <Space>
        <Form.Item 
          name='passphraseFormat' 
          label='Passphrase format'
          rules={[{ required: true }]}
          initialValue={state.passphraseFormat}
          extra={passphraseFormatDescription[state.passphraseFormat]}
        >
          <Select
            onChange={onFormatChange}
          >
            {passphraseOptions}
          </Select>
        </Form.Item>
        <FieldExtraTooltip>
          <Tooltip title= {
            /* eslint-disable */
              <div dangerouslySetInnerHTML={{ __html:FIELD_TOOLTIP.FORMAT }}></div>
              /* eslint-disable */
            } 
            placement='bottom'
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </FieldExtraTooltip>
       </Space>

       <Space >
        <Form.Item
          name='passphraseLength'
          label='Passphrase length'
          rules={[{ required: true }]}
          initialValue={state.passphraseLength}
          children={<Input />}
        />
        <Tooltip title={FIELD_TOOLTIP.LENGTH} placement='bottom'>
          <QuestionCircleOutlined />
        </Tooltip>
       </Space>
      <Form.Item 
        name='expiration' 
        label='Passphrase expiration'
        rules={[{ required: true }]}
        initialValue={state.expiration}
      >
        <Select
          style={{ width: '100%' }}
          onChange={onExpirationChange}
        >
          {expirationOptions}
        </Select>
      </Form.Item>
    </React.Fragment>
  )
}

import React, { useState } from 'react'

import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Radio, Space } from 'antd'
import {
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Tooltip
} from 'antd'

import { StepsForm }                               from '@acx-ui/components'
import { WlanSecurityEnum, NetworkTypeEnum, PassphraseFormatEnum, DpskNetworkType, 
  transformDpskNetwork, PassphraseExpirationEnum }      from '@acx-ui/rc/utils'

import { NetworkDiagram }    from '../NetworkDiagram/NetworkDiagram'
import { FieldExtraTooltip } from '../styledComponents'

import { CloudpathServerForm } from './CloudpathServerForm'

const { Option } = Select

const { useWatch } = Form

export function DpskSettingsForm () {
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
  const [
    isCloudpathEnabled
  ] = [
    useWatch('isCloudpathEnabled')
  ]

  return (
    <>
      <StepsForm.Title>DPSK Settings</StepsForm.Title>
      <Form.Item
        label='Security Protocol'
        name='dpskWlanSecurity'
        initialValue={WlanSecurityEnum.WPA2Personal}
      >
        <Select>
          <Option value={WlanSecurityEnum.WPA2Personal}>
            WPA2 (Recommended)
          </Option>
          <Option value={WlanSecurityEnum.WPAPersonal}>WPA</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name='isCloudpathEnabled'
        initialValue={false}
      >
        <Radio.Group>
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
      {isCloudpathEnabled ? <CloudpathServerForm /> : <PassphraseGeneration />}
      { /*TODO: <div><Button type='link' style={{ padding: 0 }}>Show more settings</Button></div> */ }
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
      <Row align='middle' gutter={8}>
        <Col span={23}>
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
        </Col>
        <Col span={1}>
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
        </Col>  
      </Row>
      
      
      <Row align='middle' gutter={8}>
        <Col span={23}>
          <Form.Item
            name='passphraseLength'
            label='Passphrase length'
            rules={[{ required: true }]}
            initialValue={state.passphraseLength}
            children={<InputNumber min={8} max={63} style={{ width: '100%' }}/>}
          />
        </Col>
        <Col span={1}>
          <Tooltip title={FIELD_TOOLTIP.LENGTH} placement='bottom'>
            <QuestionCircleOutlined />
          </Tooltip>
        </Col>
       </Row>

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

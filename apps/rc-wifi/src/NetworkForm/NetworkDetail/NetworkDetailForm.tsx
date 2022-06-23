import { useState, useContext } from 'react'

import { Form, Input, Col, Radio, Row, Space } from 'antd'
import TextArea                                from 'antd/lib/input/TextArea'

import { StepsForm }       from '@acx-ui/components'
import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram }   from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext   from '../NetworkFormContext'
import { RadioDescription } from '../styledComponents'

import type { RadioChangeEvent } from 'antd'

const NetworkTypeDescription = {
  [NetworkTypeEnum.PSK]: `Require users to enter a passphrase 
                          (that you have defined for the network) to connect`,
  [NetworkTypeEnum.DPSK]: `Require users to enter a passphrase to connect. 
                          The passphrase is unique per device`,
  [NetworkTypeEnum.AAA]: `Use 802.1X standard and WPA2 security protocols to authenticate 
                          users using an authentication server on thenetwork`,
  [NetworkTypeEnum.CAPTIVEPORTAL]: `Users are authorized through a captive portal 
                                    in various methods`,
  [NetworkTypeEnum.OPEN]: `Allow users to access the network without 
                          any authentication/security(not recommended)`
}

const NetworkTypeLabel = {
  [NetworkTypeEnum.PSK]: 'Pre-Shared Key (PSK)',
  [NetworkTypeEnum.DPSK]: 'Dynamic Pre-Shared Key (DPSK)',
  [NetworkTypeEnum.AAA]: 'Enterprise AAA (802.1X)',
  [NetworkTypeEnum.CAPTIVEPORTAL]: 'Captive portal',
  [NetworkTypeEnum.OPEN]: 'Open Network'
}

const NetworkTypeTitle = {
  [NetworkTypeEnum.AAA]: 'AAA Settings', 
  [NetworkTypeEnum.OPEN]: 'Settings',
  [NetworkTypeEnum.DPSK]: 'DPSK Settings'
}

export function NetworkDetailForm () {
  const { setSettingStepTitle } = useContext(NetworkFormContext)
  const [ networkType, setNetworkType ] = useState('')
  const onChange = (e: RadioChangeEvent) => {
    setSettingStepTitle(NetworkTypeTitle[ e.target.value as keyof typeof NetworkTypeTitle ])
    setNetworkType(e.target.value)
  }
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>Network Details</StepsForm.Title>
        <Form.Item
          name='name'
          label='Network Name'
          rules={[{ required: true }, { min: 2 }, { max: 32 }]}
          children={<Input />}
        />
        <Form.Item
          name='description'
          label='Description'
          children={<TextArea rows={4} maxLength={64} />}
        />
        <Form.Item
          name='type'
          label='Network Type'
          rules={[{ required: true }]}
        >
          <Radio.Group onChange={onChange}>
            <Space direction='vertical'>
              <Radio value={NetworkTypeEnum.PSK} disabled>
                {NetworkTypeLabel.psk}
                <RadioDescription>
                  {NetworkTypeDescription.psk}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.DPSK}>
                {NetworkTypeLabel.dpsk}
                <RadioDescription>
                  {NetworkTypeDescription.dpsk}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.AAA}>
                {NetworkTypeLabel.aaa}
                <RadioDescription>
                  {NetworkTypeDescription.aaa}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.CAPTIVEPORTAL} disabled>
                {NetworkTypeLabel.guest}
                <RadioDescription>
                  {NetworkTypeDescription.guest}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.OPEN}>
                {NetworkTypeLabel.open}
                <RadioDescription>
                  {NetworkTypeDescription.open}
                </RadioDescription>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Col>

      <Col span={14}>
        <NetworkDiagram type={networkType}/>
      </Col>
    </Row>
  )
}

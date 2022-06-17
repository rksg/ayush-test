import Radio                             from '@ant-design/pro-form/lib/components/Radio'
import { Checkbox, Col, Form, Input, Row, Switch } from 'antd'
import TextArea                          from 'antd/lib/input/TextArea'

import { StepsForm } from '@acx-ui/components'




export function NetworkMoreSettingsForm () {
  return (
    <Row gutter={0}>
      <Col span={24}>
        <StepsForm.Title>VLAN</StepsForm.Title>
        <Form.Item
          name='enableVlanPooling'
          children={<>
            <div style={{ fontSize: '12px', float: 'left' }}>VLAN Pooling:</div>
            <Switch style={{ marginLeft: '8px' }}/></>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '66px 200px', columnGap: '13px' }}>
          <Form.Item
            name='vlanId'
            label='VLAN ID'
            children={<Input></Input>}
          />
          <Form.Item
            name='name'
            style={{ fontSize: '12px' }}
            label=' '
            children={<><Checkbox style={{ marginRight: '8px' }} /> Dynamic VLAN</>}
          />
        </div>

        <Form.Item
          name='enableProxyArp'
          children={<>
            <div style={{ fontSize: '12px', float: 'left' }}>Proxy ARP:</div>
            <Switch style={{ marginLeft: '24px' }}/></>}
        />
      </Col>

      <Col span={24}>
        <StepsForm.Title>Services</StepsForm.Title>
        <Form.Item
          name='enableDnsProxy'
          children={<>
            <div style={{ fontSize: '12px', float: 'left', width: '125px' }}>DNS Proxy:</div>
            <Switch /></>}
        />
        <Form.Item
          name='enableWifiCalling'
          children={<>
            <div style={{ fontSize: '12px', float: 'left', width: '125px' }}>Wi-Fi Calling:</div>
            <Switch /></>}
        />
      </Col>

      <Col span={24}>
        <StepsForm.Title>Radio</StepsForm.Title>
        <Form.Item
          name='description2'
          label='Description'
          children={<TextArea rows={4} maxLength={64} />}
        />
      </Col>
    </Row>
  )
}

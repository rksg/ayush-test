import React from 'react'

import { Col, Collapse, Form,
  Input, Row, Switch } from 'antd'


import { StepsForm } from '@acx-ui/components'

import * as UI from './styledComponents'

const { Panel } = Collapse


export function NetworkMoreSettingsForm () {
  return (
    <Row gutter={0}>
      <Col span={24}>
        <StepsForm.Title>VLAN</StepsForm.Title>
        <Form.Item
          name='enableVlanPooling'
          style={{ marginBottom: '10px' }}
          children={<>
            <UI.FieldLabel
              width='90px'>VLAN Pooling:</UI.FieldLabel>
            <Switch /></>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr' }}>
          <Form.Item
            name='vlanId'
            label='VLAN ID'
            style={{ marginBottom: '15px' }}
            children={<Input style={{ width: '66px' }}></Input>}
          />
          <Form.Item
            name='name'
            label={<span></span>}
            style={{ marginBottom: '15px' }}
            children={
              <UI.Label>
                <UI.CheckboxWrapper />
                Dynamic VLAN
              </UI.Label>}
          />
        </div>

        <UI.FormItemNoLabel
          name='enableProxyArp'
          children={<>
            <UI.FieldLabel
              width='90px'>Proxy ARP:</UI.FieldLabel>
            <Switch/></>}
        />
      </Col>

      <Col span={24}>
        <StepsForm.Title style={{ margin: '20px 0' }}>Services</StepsForm.Title>
        <UI.FormItemNoLabel
          name='enableDnsProxy'
          children={<>
            <UI.FieldLabel
              width='125px'>DNS Proxy:</UI.FieldLabel>
            <Switch /></>}
        />
        <UI.FormItemNoLabel
          name='enableWifiCalling'
          children={<>
            <UI.FieldLabel
              width='125px'>Wi-Fi Calling:</UI.FieldLabel>
            <Switch /></>}
        />
        <UI.FormItemNoLabel
          name='enableClientIsolation'
          children={<>
            <UI.FieldLabel
              width='125px'>Client Isolation:</UI.FieldLabel>
            <Switch /></>}
        />
        <UI.FormItemNoLabel
          name='enableAntiSpoofing'
          children={<>
            <UI.FieldLabel
              width='125px'>Anti-spoofing:</UI.FieldLabel>
            <Switch /></>}
        />
        <UI.FormItemNoLabel
          name='enableDhcp'
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Force DHCP
            </UI.Label>}
        />
        <UI.FormItemNoLabel
          name='enableSyslog'
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Enable logging client data to external syslog
            </UI.Label>}
        />

      </Col>

      <Col span={24}>
        <StepsForm.Title style={{ margin: '20px 0' }}>Radio</StepsForm.Title>
        <UI.FormItemNoLabel
          name='hideSsid'
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Hide SSID
            </UI.Label>}
        />

        <StepsForm.Title
          style={{
            fontSize: 'var(--acx-subtitle-4-font-size)',
            fontWeight: '600',
            margin: '20px 0'
          }}
        >Load Control</StepsForm.Title>

        <UI.FormItemNoLabel
          name='hideSsid'
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
              Hide SSID
            </UI.Label>}
        />


        <Collapse defaultActiveKey={['1']}>
          <Panel header='This is panel header 1' key='1'>
            <p>test</p>
          </Panel>
          <Panel header='This is panel header 2' key='2'>
            <p>test2</p>
          </Panel>
          <Panel header='This is panel header 3' key='3'>
            <p>test3</p>
          </Panel>
        </Collapse>
      </Col>
    </Row>
  )
}
